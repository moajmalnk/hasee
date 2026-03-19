import { toast } from "sonner";
import {
  canUseBrowserNotifications,
  getNotificationPermission,
  showBrowserNotification,
  type BrowserNotificationInput,
} from "@/services/browserNotifications";
import type { NotificationPriority } from "@/context/NotificationCenterContext";

export interface AppNotificationInput {
  title: string;
  message: string;
  priority?: NotificationPriority;
  source?: string;
  browser?: Omit<BrowserNotificationInput, "title" | "body">;
}

interface NotifyOptions {
  center?: {
    addNotification: (input: {
      title: string;
      message: string;
      priority: NotificationPriority;
      source?: string;
    }) => void;
  };
  allowBrowserNotification?: boolean;
}

const DEDUPE_WINDOW_MS = 4500;
const BROWSER_NOTIFICATIONS_PREF_KEY = "hasee.browserNotifications.enabled";
const recentNotificationTimes = new Map<string, number>();

export function setBrowserNotificationsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BROWSER_NOTIFICATIONS_PREF_KEY, enabled ? "1" : "0");
}

export function isBrowserNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(BROWSER_NOTIFICATIONS_PREF_KEY) === "1";
}

function shouldThrottle(key: string): boolean {
  const now = Date.now();
  const previous = recentNotificationTimes.get(key);
  recentNotificationTimes.set(key, now);
  return typeof previous === "number" && now - previous < DEDUPE_WINDOW_MS;
}

function notifyToast(input: AppNotificationInput, priority: NotificationPriority) {
  const text = input.message;
  if (priority === "success") toast.success(text);
  else if (priority === "warning") toast.warning(text);
  else if (priority === "error") toast.error(text);
  else toast.info(text);
}

export function notifyApp(input: AppNotificationInput, options?: NotifyOptions) {
  const priority = input.priority ?? "info";
  const dedupeKey = `${input.source ?? "app"}|${priority}|${input.title}|${input.message}`;
  if (shouldThrottle(dedupeKey)) return;

  notifyToast(input, priority);

  options?.center?.addNotification({
    title: input.title,
    message: input.message,
    priority,
    source: input.source,
  });

  const shouldUseBrowser = options?.allowBrowserNotification ?? isBrowserNotificationsEnabled();
  if (!shouldUseBrowser) return;
  if (!canUseBrowserNotifications() || getNotificationPermission() !== "granted") return;

  showBrowserNotification({
    title: input.title,
    body: input.message,
    icon: input.browser?.icon,
    tag: input.browser?.tag,
  });
}
