import { Schema, model, Types } from "mongoose";

// one payment document represents one Razorpay order. Razorpay payment IDs are stored after successful checkout

export enum PaymentStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  CAPTURED = "CAPTURED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentType {
  MENTORSHIP = "MENTORSHIP",
}

export interface IPayment {
  userId: string;
  mentorId?: string;

  type: PaymentType;

  amount: number;
  currency: string;

  status: PaymentStatus;

  razorpayOrderId: string;
  razorpayPaymentId?: string;

  mentorshipId?: string;

  receipt: string;

  failureReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  mentorId: {
    type: String,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(PaymentType),
    required: true,
  },

  /*
Amount is stored in the smallest currency unit. Example: ₹999 -> 99900 paise
*/

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
    enum: Object.values(PaymentStatus),
    required: true,
    default: PaymentStatus.CREATED,
    index: true,
  },

  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  mentorshipId: {
    type: String,
    index: true,
  },

  receipt: {
    type: String,
    required: true,
    unique: true,
  },
  failureReason: {
    type: String 
  }
}, {
    timestamps: true 
});

export default model<IPayment>("Payment", paymentSchema) ; 