import { Schema, model } from "mongoose";

// represents whether a candidate currently has permission to communicate with a mentor. Payment service owns the subscription/payment. Chat service owns the actual chat-access projection

export enum MentorshipAccessStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
}

export interface IMentorshipAccess {
  candidateId: string;
  mentorId: string;

  // razorpay subscription that granted this access

  razorpaySubscriptionId: string;

  // current access gate

  status: MentorshipAccessStatus;

  // end of the currently paid billing period - chat service can use this as an additional safety check before allowing messages

  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const mentorshipAccessSchema = new Schema<IMentorshipAccess>(
  {
    candidateId: {
      type: String,
      required: true,
      index: true,
    },

    mentorId: {
      type: String,
      required: true,
      index: true,
    },

    razorpaySubscriptionId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(MentorshipAccessStatus),
      required: true,
      default: MentorshipAccessStatus.ACTIVE,
      index: true,
    },

    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// there should only be one access projection for a candidate + mentor + Razorpay subscription 

mentorshipAccessSchema.index(
  {
    candidateId: 1,
    mentorId: 1,
    razorpaySubscriptionId: 1,
  },
  {
    unique: true,
  },
);

export default model<IMentorshipAccess>(
  "MentorshipAccess",
  mentorshipAccessSchema,
);