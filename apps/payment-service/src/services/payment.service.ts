import Payment, {
  PaymentStatus,
  PaymentType,
} from "../models/payment.model.js";
import razorpay from "../providers/razorpay.provider.js";
import type {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
} from "../types/payment.types.js";
import { createHmac } from "node:crypto";

// creates a razorpay order and stores the local payment record 

export const createPaymentOrder = async (
  userId: string,
  input: CreatePaymentOrderInput,
) => {
  if (!input.amount || input.amount <= 0) {
    return {
      success: false,
      message: "Invalid payment amount",
    };
  }

  // razorpay expects amount in the smallest currency unit

  const amount = Math.round(input.amount * 100);

  const receipt = `mentorship_${crypto.randomUUID()}`;

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt,
    notes: {
      userId,
      mentorId: input.mentorId,
      mentorshipId: input.mentorshipId ?? "",
      type: PaymentType.MENTORSHIP,
    },
  });

  const payment = await Payment.create({
    userId,
    mentorId: input.mentorId,
    mentorshipId: input.mentorshipId,

    type: PaymentType.MENTORSHIP,

    amount,
    currency: "INR",

    status: PaymentStatus.CREATED,
    razorpayOrderId: order.id,

    receipt,
  });

  return {
    success: true,
    data: {
      paymentId: payment._id,
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  };
};

// Verifies the Razorpay Checkout signature and marks the local payment as captured

export const verifyPayment = async (
  userId: string,
  input: VerifyPaymentInput,
) => {
  const payment = await Payment.findOne({
    razorpayOrderId: input.razorpayOrderId,
    userId,
  });

  if (!payment) {
    return {
      success: false,
      message: "Payment order not found",
    };
  }

  // Creating an HMAC using SHA-256 and the Razorpay secret. This generates the signature that our server expects Razorpay's payment response to have 

  const generatedSignature = createHmac(
    "sha256", 
    process.env.RAZORPAY_KEY_SECRET!
  )
    .update(`${payment.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== input.razorpaySignature) {
    return {
      success: false,
      message: "Invalid payment signature",
    };
  }

  // make verification idempotent

  if(payment.status === PaymentStatus.CAPTURED) {
    return {
        success: true, 
        data: payment 
    }
  }

  payment.razorpayPaymentId = input.razorpayPaymentId ; 

  payment.status = PaymentStatus.CAPTURED ;

  await payment.save() ; 

  return {
    success: true, 
    data: payment 
  }
};

// returns the authenticated user's payment history 

export const getPaymentHistory = async (
    userId: string 
) => {
    const payments = await Payment.find({
        userId 
    })
        .sort({
            createdAt: -1
        })
        .lean() ; 

    return {
        success: true, 
        data: payments
    }
}