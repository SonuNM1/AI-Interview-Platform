import Subscription, {
  SubscriptionStatus,
} from "../models/subscription.model.js";

import Payment, {
  PaymentStatus,
  PaymentType,
} from "../models/payment.model.js";

import razorpay from "../providers/razorpay.provider.js";

interface CreateMentorshipSubscriptionInput {
  mentorId: string;
  amount: number;
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

  if (!input.amount || input.amount <= 0) {
    return {
      success: false,
      message: "Invalid subscription amount",
    };
  }

  // convert rupees to paise

  const amount = Math.round(input.amount * 100);

  //   creates the razorpay plan

  const plan = await razorpay.plans.create({
    period: "monthly",
    interval: 1,

    item: {
      name: `Mentorship with ${input.mentorId}`,
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
