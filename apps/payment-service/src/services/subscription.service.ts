import Subscription, {
  SubscriptionStatus,
} from "../models/subscription.model.js";
import Payment, {
  PaymentStatus,
  PaymentType,
} from "../models/payment.model.js";
import razorpay from "../providers/razorpay.provider.js";
import axios from "axios";
import crypto from "node:crypto";
import { publishMentorshipAccessGranted } from "./mentorship-access.service.js";

interface CreateMentorshipSubscriptionInput {
  mentorId: string;
}

// creates a razorpay monthly plan and subscription for a candidate purchasing mentorship access

export const createMentorshipSubscription = async (
  userId: string,
  input: CreateMentorshipSubscriptionInput,
) => {
  if (!input.mentorId) {
    return {
      success: false,
      message: "Mentor ID is required",
    };
  }

  // Fetch the mentor's current marketplace profile from User Service. The candidate is never trusted to provide the subscription price

  const userServiceUrl = process.env.USER_SERVICE_URL;

  if (!userServiceUrl) {
    return {
      success: false,
      message: "USER_SERVICE_URL is not configured",
    };
  }

  const mentorResponse = await axios.get(
    `${userServiceUrl}/api/v1/users/mentors/${input.mentorId}`,
  );

  const mentor = mentorResponse.data?.data;

  if (!mentor) {
    return {
      success: false,
      message: "Mentor not found",
    };
  }

  if (!mentor.mentorProfile?.mentorshipEnabled) {
    return {
      success: false,
      message: "This mentor is currently unavailable for mentorship",
    };
  }

  const monthlyMentorshipAmount = Number(
    mentor.mentorProfile.monthlyMentorshipAmount,
  );

  if (
    !Number.isInteger(monthlyMentorshipAmount) ||
    monthlyMentorshipAmount <= 0
  ) {
    return {
      success: false,
      message: "Mentor has an invalid mentorship price",
    };
  }

  // Razorpay expects the amount in paise.
  const amount = Math.round(monthlyMentorshipAmount * 100);

  //   creates the razorpay plan

  const plan = await razorpay.plans.create({
    period: "monthly",
    interval: 1,

    item: {
      name: `Mentorship with ${
        `${mentor.firstName ?? ""} ${mentor.lastName ?? ""}`.trim() || "Mentor"
      }`,
      amount,
      currency: "INR",
      description: "Monthly mentor subscription",
    },

    notes: {
      mentorId: input.mentorId,
      userId,
      type: PaymentType.MENTORSHIP,
    },
  });

  // Create a Razorpay Subscription using the plan.

  const totalCount = 120;

  const razorpaySubscription = await razorpay.subscriptions.create({
    plan_id: plan.id,
    total_count: totalCount,
    quantity: 1,
    customer_notify: true,

    notes: {
      userId,
      mentorId: input.mentorId,
      type: PaymentType.MENTORSHIP,
    },
  });

  // store our local subscription model

  const subscription = await Subscription.create({
    userId,
    mentorId: input.mentorId,

    amount,
    currency: "INR",

    status: SubscriptionStatus.CREATED,

    razorpayPlanId: plan.id,
    razorpaySubscriptionId: razorpaySubscription.id,

    paidCount: 0,
    totalCount,
  });

  return {
    success: true,

    data: {
      subscriptionId: subscription._id,

      razorpaySubscriptionId: razorpaySubscription.id,

      razorpayPlanId: plan.id,

      amount,
      currency: "INR",

      keyId: process.env.RAZORPAY_KEY_ID,
    },
  };
};

// Verifies the payment signature returned by Razorpay Subscription Checkout. The subscription ID is looked up from our database instead of trusting the subscription ID supplied by the browser.

export const verifyMentorshipSubscriptionPayment = async (
  userId: string,
  input: {
    razorpaySubscriptionId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) => {
  const subscription = await Subscription.findOne({
    userId,
    razorpaySubscriptionId: input.razorpaySubscriptionId,
  });

  if (!subscription) {
    return {
      success: false,
      message: "Mentorship subscription not found",
    };
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${input.razorpayPaymentId}|${subscription.razorpaySubscriptionId}`)
    .digest("hex");

  if (generatedSignature !== input.razorpaySignature) {
    return {
      success: false,
      message: "Invalid subscription payment signature",
    };
  }

  // the checkout payment is successfully verified. Mark the local subscription as active immediately

  subscription.status = SubscriptionStatus.ACTIVE;

  // fetching the latest subscription state from Razorpay so that our local access projection gets the correct billing period

  try {
    const razorpaySubscription = await razorpay.subscriptions.fetch(
      input.razorpaySubscriptionId,
    );

    subscription.currentStart = razorpaySubscription.current_start
      ? new Date(razorpaySubscription.current_start * 1000)
      : undefined;

    subscription.currentEnd = razorpaySubscription.current_end
      ? new Date(razorpaySubscription.current_end * 1000)
      : undefined;

    if (typeof razorpaySubscription.paid_count === "number") {
      subscription.paidCount = razorpaySubscription.paid_count;
    }
  } catch (error) {
    console.error("unable to fetch razorpay subscription details", error);
  }

  await subscription.save();

  // grant the initial mentorship access immediately. Imp since razorpya webhooks cannot reach localhost during local development

  await publishMentorshipAccessGranted({
    _id: subscription._id,
    userId: subscription.userId,
    mentorId: subscription.mentorId,
    amount: subscription.amount,
    currency: subscription.currency,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySubscriptionId: subscription.razorpaySubscriptionId,
    currentEnd: subscription.currentEnd,
  });

  return {
    success: true,
    data: {
      verified: true,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
    },
  };
};
