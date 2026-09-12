import api from "./api";

export interface Notification {
  _id: string;
  userId: string;
  type: string;
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

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications");
  return response.data.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsAsRead = async () => {
  await api.patch("/notifications/read-all");
};