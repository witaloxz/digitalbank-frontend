import { api } from "../lib/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: (page = 0, size = 20) =>
    api.get<{ content: Notification[]; totalElements: number }>(`/api/v1/notifications?page=${page}&size=${size}`),

  getUnreadCount: () =>
    api.get<number>("/api/v1/notifications/unread/count"),

  markAllAsRead: () =>
    api.patch("/api/v1/notifications/mark-all-read"),
};