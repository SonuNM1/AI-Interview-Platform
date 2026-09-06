import { Schema, model } from "mongoose";

// local subscription status

export enum SubscriptionStatus {
  CREATED = "CREATED",
  AUTHENTICATED = "AUTHENTICATED",
  ACTIVE = "ACTIVE",
  HALTED = "HALTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
}

export interface ISubscription {
  userId: string;
  mentorId: string;

  // mentor's monthly price at the time the subscription was created

  amount: number; // stored in paise

  currency: string;
  status: SubscriptionStatus;

  // Razorpay Plan and Subscription IDs

  razorpayPlanId: string;
  razorpaySubscriptionId: string;

  // current billing period

  currentStart?: Date;
  currentEnd?: Date;

  // number of successsful billing cycles

  paidCount: number;

  // total billing cycles configured for this subscription

  totalCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    mentorId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      required: true,
      default: SubscriptionStatus.CREATED,
      index: true,
    },

    razorpayPlanId: {
      type: String,
      required: true,
      index: true,
    },
    razorpaySubscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    currentStart: {
      type: Date,
    },
    currentEnd: {
      type: Date,
    },

    paidCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCount: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);


// prevent multiple active subscriptions between the same candidate and mentor. We intentionally do not make this a MongoDB unique index because a candidate may subscribe again after cancellation 

subscriptionSchema.index({
  userId: 1,
  mentorId: 1,
  status: 1,
});

export default model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);