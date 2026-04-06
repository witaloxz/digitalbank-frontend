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
    api.get<{ content: Notification[]; totalElements: number }>(`/notifications?page=${page}&size=${size}`),

  getUnreadCount: () =>
    api.get<number>("/notifications/unread/count"),

  markAllAsRead: () =>
    api.patch("/notifications/mark-all-read"),
};