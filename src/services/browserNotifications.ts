export interface BrowserNotificationInput {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export function canUseBrowserNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!canUseBrowserNotifications()) return "denied";
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!canUseBrowserNotifications()) return "denied";
  return Notification.requestPermission();
}

export function showBrowserNotification(input: BrowserNotificationInput): boolean {
  if (!canUseBrowserNotifications() || Notification.permission !== "granted") return false;
  const notification = new Notification(input.title, {
    body: input.body,
    icon: input.icon ?? "/icons/icon-192.svg",
    tag: input.tag,
    badge: "/icons/icon-192.svg",
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return true;
}
