import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type NotificationPriority = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  createdAt: string;
  read: boolean;
  source?: string;
}

interface NotificationCenterContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (input: Omit<NotificationItem, "id" | "createdAt" | "read">) => NotificationItem;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(null);
const MAX_NOTIFICATIONS = 60;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `notif-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback(
    (input: Omit<NotificationItem, "id" | "createdAt" | "read">): NotificationItem => {
      const next: NotificationItem = {
        ...input,
        id: createId(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [next, ...prev].slice(0, MAX_NOTIFICATIONS));
      return next;
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }),
    [addNotification, clearAll, markAllAsRead, markAsRead, notifications, unreadCount],
  );

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error("useNotificationCenter must be used within NotificationCenterProvider");
  }
  return context;
}
