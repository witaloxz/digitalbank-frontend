import { useEffect, useReducer, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { notificationService, Notification } from "@/service/notification.service";
import { notificationSocket } from "@/adapters/notification.socket";

type State = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
};

type Action =
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "SET_UNREAD_COUNT"; payload: number }
  | { type: "SET_LOADING"; payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    notifications: [],
    unreadCount: 0,
    loading: true,
  });

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await notificationService.getNotifications(0, 20);
      dispatch({ type: "SET_NOTIFICATIONS", payload: res.data.content });
      const countRes = await notificationService.getUnreadCount();
      dispatch({ type: "SET_UNREAD_COUNT", payload: countRes.data });
    } catch {
      console.error("Erro ao carregar notificações");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user]);

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    dispatch({ type: "SET_UNREAD_COUNT", payload: 0 });
    dispatch({
      type: "SET_NOTIFICATIONS",
      payload: state.notifications.map((n) => ({ ...n, read: true })),
    });
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    const socket = notificationSocket.connect(user.id, (newNotification) => {
      dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });
    });

    return () => {
      notificationSocket.disconnect();
    };
  }, [user, loadNotifications]);

  return { ...state, loadNotifications, markAllAsRead };
};