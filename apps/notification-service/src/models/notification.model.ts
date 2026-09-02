import mongoose, { Schema, Document } from "mongoose";

// Supported in-app notification types.

export enum NotificationType {
  INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
  INTERVIEW_RESCHEDULED = "INTERVIEW_RESCHEDULED",
  INTERVIEW_UPDATED = "INTERVIEW_UPDATED",
  INTERVIEW_CANCELLED = "INTERVIEW_CANCELLED",
  INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED",
}

// Persistent in-app notification document.

export interface NotificationDocument extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: {
    interviewId?: string;
    scheduledAt?: string;
    previousScheduledAt?: string;
    role?: string;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      interviewId: String,
      scheduledAt: String,
      previousScheduledAt: String,
      role: String,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification = mongoose.model<NotificationDocument>(
  "Notification",
  notificationSchema,
);