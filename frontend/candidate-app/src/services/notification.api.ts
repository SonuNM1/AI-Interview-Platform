import api from "./api";

export type NotificationType =
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_UPDATED"
  | "INTERVIEW_CANCELLED";

export interface CandidateNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: {
    interviewId?: string;
    scheduledAt?: string;
    previousScheduledAt?: string;
    role?: string;
    duration?: number;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: CandidateNotification[];
}

/* Fetches persistent notifications for the authenticated candidate */

export async function getNotifications() {
  const response =
    await api.get<NotificationsResponse>(
      "/notifications",
    );

  return response.data;
}

/* Marks one notification as read */

export async function markNotificationAsRead(
  notificationId: string,
) {
  const response =
    await api.patch(
      `/notifications/${notificationId}/read`,
    );

  return response.data;
}

/* Marks all candidate notifications as read */

export async function markAllNotificationsAsRead() {
  const response =
    await api.patch(
      "/notifications/read-all",
    );

  return response.data;
}