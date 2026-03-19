import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/services/mockApi";
import type { SettingsData } from "@/services/mockApi";
import { Settings2 } from "lucide-react";
import {
  canUseBrowserNotifications,
  getNotificationPermission,
  requestBrowserNotificationPermission,
} from "@/services/browserNotifications";
import { notifyApp, setBrowserNotificationsEnabled } from "@/services/notifications";
import { useNotificationCenter } from "@/context/NotificationCenterContext";

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotificationCenter();

  useEffect(() => {
    void (async () => {
      try {
        const res = await getSettings();
        setBrowserNotificationsEnabled(Boolean(res.notificationsEnabled));
        setSettings(res);
      } catch {
        toast.error("Failed to load settings (mock)");
      }
    })();
  }, []);

  if (!settings) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 text-muted-foreground">Loading settings (mock)...</div>
      </AppLayout>
    );
  }

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await updateSettings(settings);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", !!res.darkMode);
      }
      setBrowserNotificationsEnabled(Boolean(res.notificationsEnabled));
      toast.success("Settings saved (mock)");
    } catch {
      toast.error("Failed to save settings (mock)");
    } finally {
      setSaving(false);
    }
  };

  const onNotificationsToggle = async (enabled: boolean) => {
    if (!enabled) {
      setSettings((s) => (s ? { ...s, notificationsEnabled: false } : s));
      setBrowserNotificationsEnabled(false);
      notifyApp(
        {
          title: "Notifications paused",
          message: "Browser notifications are disabled.",
          priority: "info",
          source: "settings",
        },
        { center: { addNotification }, allowBrowserNotification: false },
      );
      return;
    }

    if (!canUseBrowserNotifications()) {
      setSettings((s) => (s ? { ...s, notificationsEnabled: true } : s));
      notifyApp(
        {
          title: "Limited support",
          message: "This browser does not support native notifications. In-app notifications will continue.",
          priority: "warning",
          source: "settings",
        },
        { center: { addNotification }, allowBrowserNotification: false },
      );
      return;
    }

    let permission = getNotificationPermission();
    if (permission !== "granted") {
      permission = await requestBrowserNotificationPermission();
    }

    const granted = permission === "granted";
    setSettings((s) => (s ? { ...s, notificationsEnabled: granted } : s));
    setBrowserNotificationsEnabled(granted);

    if (granted) {
      notifyApp(
        {
          title: "Notifications enabled",
          message: "You will receive local browser alerts for important updates.",
          priority: "success",
          source: "settings",
        },
        { center: { addNotification }, allowBrowserNotification: true },
      );
      return;
    }

    notifyApp(
      {
        title: "Permission required",
        message: "Browser notifications are blocked. Please allow them in browser settings.",
        priority: "warning",
        source: "settings",
      },
      { center: { addNotification }, allowBrowserNotification: false },
    );
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h1 className="text-2xl font-black text-foreground">Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">Personalize your experience (mock).</p>
        </header>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div>
              <p className="text-sm font-bold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Order and reward updates</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(v) => {
                void onNotificationsToggle(v);
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div>
              <p className="text-sm font-bold text-foreground">Marketing</p>
              <p className="text-xs text-muted-foreground">Offers and referral reminders</p>
            </div>
            <Switch
              checked={settings.marketingEnabled}
              onCheckedChange={(v) => setSettings((s) => (s ? { ...s, marketingEnabled: v } : s))}
            />
          </div>

          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div>
              <p className="text-sm font-bold text-foreground">Dark mode</p>
              <p className="text-xs text-muted-foreground">Softer contrast at night</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(v) => setSettings((s) => (s ? { ...s, darkMode: v } : s))}
            />
          </div>
        </div>

        <Button onClick={onSave} disabled={saving} className="w-full h-12 rounded-xl text-base">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </AppLayout>
  );
}

