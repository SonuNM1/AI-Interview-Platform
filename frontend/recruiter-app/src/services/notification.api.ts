import api from "./api";

export type RecruiterNotificationType =
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_UPDATED"
  | "INTERVIEW_CANCELLED"
  | "INTERVIEW_COMPLETED";

export interface RecruiterNotification {
  _id: string;
  userId: string;
  type: RecruiterNotificationType;
  title: string;
  message: string;
  metadata?: {
    interviewId?: string;
    scheduledAt?: string;
    previousScheduledAt?: string;
    role?: string;
  };
    isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: RecruiterNotification[];
}

// Fetches persistent notifications belonging to the authenticated recruiter

export async function getNotifications() {
  const response =
    await api.get<NotificationsResponse>("/notifications");

  return response.data;
}

// Marks one recruiter notification as read

export async function markNotificationAsRead(
  notificationId: string,
) {
  const response = await api.patch(
    `/notifications/${notificationId}/read`,
  );

  return response.data;
}

// Marks all recruiter notifications as read.

export async function markAllNotificationsAsRead() {
  const response = await api.patch("/notifications/read-all");

  return response.data;
}