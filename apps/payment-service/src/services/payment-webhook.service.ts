import crypto from "crypto";
import Payment, {
  PaymentStatus,
  PaymentType,
} from "../models/payment.model.js";
import Subscription, {
  SubscriptionStatus,
} from "../models/subscription.model.js";
import {
  publishMentorshipAccessGranted,
  publishMentorshipAccessRevoked,
} from "./mentorship-access.service.js";

// Converts a Razorpay Unix timestamp into a JavaScript Date

const unixToDate = (timestamp?: number) => {
  if (!timestamp) {
    return undefined;
  }

  return new Date(timestamp * 1000);
};

// Verifies that the webhook really came from Razorpay. Razorpay requires the raw request body for webhook signature verification.

export const verifyWebhookSignature = (rawBody: Buffer, signature: string) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
};

// Processes Razorpay payment/order/subscription webhook events.

export const processPaymentWebhook = async (event: string, payload: any) => {
  // ============================================================
  // ONE-TIME PAYMENT EVENTS
  // ============================================================

  if (event === "payment.captured" || event === "order.paid") {
    const paymentEntity = payload?.payment?.entity;

    const orderEntity = payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (!razorpayOrderId) {
      return;
    }

    const payment = await Payment.findOne({
      razorpayOrderId,
    });

    if (!payment) {
      return;
    }

    // Webhooks can be delivered more than once,
    // so this operation must be idempotent.
    if (payment.status === PaymentStatus.CAPTURED) {
      return;
    }

    payment.status = PaymentStatus.CAPTURED;

    if (paymentEntity?.id) {
      payment.razorpayPaymentId = paymentEntity.id;
    }

    await payment.save();

    // Existing one-time payment flow.
    // PAYMENT_CAPTURED event can be published here later if needed.
  }

  // ============================================================
  // MENTORSHIP SUBSCRIPTION AUTHENTICATED
  // ============================================================

  // Razorpay confirms that the subscription has been
  // successfully authorized by the customer.
  if (event === "subscription.authenticated") {
    const subscriptionEntity = payload?.subscription?.entity;

    if (!subscriptionEntity?.id) {
      return;
    }

    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionEntity.id,
    });

    if (!subscription) {
      return;
    }

    subscription.status = SubscriptionStatus.AUTHENTICATED;

    subscription.currentStart = unixToDate(subscriptionEntity.current_start);

    subscription.currentEnd = unixToDate(subscriptionEntity.current_end);

    await subscription.save();

    return;
  }

  // MENTORSHIP SUBSCRIPTION ACTIVATED - Razorpay sends this when a subscription moves into the active state. The charged event is still responsible for granting/refreshing paid mentorship access.
  
  if (event === "subscription.activated") {
    const subscriptionEntity = payload?.subscription?.entity;

    if (!subscriptionEntity?.id) {
      return;
    }

    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionEntity.id,
    });

    if (!subscription) {
      return;
    }

    subscription.status = SubscriptionStatus.ACTIVE;

    subscription.currentStart = unixToDate(subscriptionEntity.current_start);

    subscription.currentEnd = unixToDate(subscriptionEntity.current_end);

    await subscription.save();

    return;
  }

  // mentorship subscription charged - Razorpay sends this whenever a subscription payment is successfully charged

  if (event === "subscription.charged") {
    const subscriptionEntity = payload?.subscription?.entity;

    if (!subscriptionEntity?.id) {
      return;
    }

    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionEntity.id,
    });

    if (!subscription) {
      return;
    }

    // Mark the local subscription as active.
    subscription.status = SubscriptionStatus.ACTIVE;

    // Update the current billing period.
    subscription.currentStart = unixToDate(subscriptionEntity.current_start);

    subscription.currentEnd = unixToDate(subscriptionEntity.current_end);

    // Razorpay provides paid_count.
    // Use it when available; otherwise increment our local count.
    if (typeof subscriptionEntity.paid_count === "number") {
      subscription.paidCount = subscriptionEntity.paid_count;
    } else {
      subscription.paidCount += 1;
    }

    await subscription.save();

    // Grant/refresh mentorship access in Chat Service.
    //
    // currentEnd is sent so Chat Service knows exactly
    // when the current paid access period expires.
    await publishMentorshipAccessGranted({
      _id: subscription._id,
      userId: subscription.userId,
      mentorId: subscription.mentorId,
      amount: subscription.amount,
      currency: subscription.currency,
      razorpayPaymentId: payload?.payment?.entity?.id ?? "unknown",
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      currentEnd: subscription.currentEnd,
    });

    return;
  }

  // ============================================================
  // MENTORSHIP SUBSCRIPTION TERMINATION EVENTS
  // ============================================================

  // These events mean the subscription should no longer
  // provide active mentorship access.
  //
  // Chat Service consumes the revoke event and marks the
  // candidate <-> mentor access as REVOKED.
  if (
    event === "subscription.halted" ||
    event === "subscription.cancelled" ||
    event === "subscription.completed"
  ) {
    const subscriptionEntity = payload?.subscription?.entity;

    if (!subscriptionEntity?.id) {
      return;
    }

    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionEntity.id,
    });

    if (!subscription) {
      return;
    }

    // Keep our local subscription status in sync
    // with Razorpay.
    if (event === "subscription.halted") {
      subscription.status = SubscriptionStatus.HALTED;
    }

    if (event === "subscription.cancelled") {
      subscription.status = SubscriptionStatus.CANCELLED;
    }

    if (event === "subscription.completed") {
      subscription.status = SubscriptionStatus.COMPLETED;
    }

    // Razorpay may provide the final/current billing period.
    if (subscriptionEntity.current_end) {
      subscription.currentEnd = unixToDate(subscriptionEntity.current_end);
    }

    await subscription.save();

    // Revoke active mentorship access in Chat Service.
    await publishMentorshipAccessRevoked(subscription.razorpaySubscriptionId);

    return;
  }

  // ============================================================
  // ONE-TIME PAYMENT FAILED
  // ============================================================

  if (event === "payment.failed") {
    const paymentEntity = payload?.payment?.entity;

    const razorpayOrderId = paymentEntity?.order_id;

    if (!razorpayOrderId) {
      return;
    }

    await Payment.findOneAndUpdate(
      {
        razorpayOrderId,
      },
      {
        $set: {
          status: PaymentStatus.FAILED,
          failureReason: paymentEntity?.error_description || "Payment failed",
        },
      },
    );

    return;
  }
};
