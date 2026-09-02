import {
  Notification,
  NotificationType,
} from "../models/notification.model.js";

interface CreateNotificationInput {
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
}

// Creates and persists an in-app notification for a user.

export const createNotification = async (
  data: CreateNotificationInput,
) => {
  return Notification.create({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    metadata: data.metadata,
    isRead: false,
  });
};

// Fetches the latest notifications for a user.

export const getUserNotifications = async (userId: string) => {
  return Notification.find({
    userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(50)
    .lean();
};

// Marks one notification as read.

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string,
) => {
  return Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId,
    },
    {
      isRead: true,
    },
    {
      new: true,
    },
  );
};

// Marks all notifications belonging to a user as read.

export const markAllNotificationsAsRead = async (userId: string) => {
  await Notification.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      isRead: true,
    },
  );
};