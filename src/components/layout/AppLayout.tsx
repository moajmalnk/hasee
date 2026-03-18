import { ReactNode, useEffect, useState } from "react";
import StickyHeader from './StickyHeader';
import MobileNav from './MobileNav';
import { getSettings } from "@/services/mockApi";
import type { SettingsData } from "@/services/mockApi";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await getSettings();
        if (cancelled) return;
        setSettings(res);
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", !!res.darkMode);
        }
      } catch {
        // Ignore; keep default theme.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <main className="pb-24 md:pb-20">
        <div className="max-w-5xl mx-auto w-full">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
