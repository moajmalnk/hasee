import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/services/mockApi";
import type { SettingsData } from "@/services/mockApi";
import { Settings2 } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getSettings();
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
      await updateSettings(settings);
      toast.success("Settings saved (mock)");
    } catch {
      toast.error("Failed to save settings (mock)");
    } finally {
      setSaving(false);
    }
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
              onCheckedChange={(v) => setSettings((s) => (s ? { ...s, notificationsEnabled: v } : s))}
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

          <div className="space-y-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
            <p className="text-sm font-bold text-foreground">Language</p>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings((s) =>
                  s ? { ...s, language: e.target.value as SettingsData["language"] } : s
                )
              }
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Language"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        <Button onClick={onSave} disabled={saving} className="w-full h-12 rounded-xl text-base">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </AppLayout>
  );
}

