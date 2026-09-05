import crypto from "crypto";
import Payment, { PaymentStatus } from "../models/payment.model.js";

// Verifies that the webhook really came from Razorpay. Razorpay requires the raw request body for webhook signature verification

export const verifyWebhookSignature = (rawBody: Buffer, signature: string) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
};

// processes razorpay payment/order webhook events

export const processPaymentWebhook = async (event: string, payload: any) => {
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

    // Webhooks can be delivered more than once, so this operation must be idempotent

    if (payment.status === PaymentStatus.CAPTURED) return;

    payment.status = PaymentStatus.CAPTURED;

    if (paymentEntity?.id) {
      payment.razorpayPaymentId = paymentEntity.id;
    }

    await payment.save();

    // next step: publish PAYMENT_CAPTURED through RabbitMQ
  }

  if (event === "payment.failed") {
    const paymentEntity =
      payload?.payment?.entity;

    const razorpayOrderId =
      paymentEntity?.order_id;

    if (!razorpayOrderId) {
      return;
    }

    await Payment.findOneAndUpdate(
        {
            razorpayOrderId
        }, 
        {
            $set: {
                status: PaymentStatus.FAILED, 
                failureReason: paymentEntity?.error_description || "Payment failed"
            }
        }
    )

  }
};
