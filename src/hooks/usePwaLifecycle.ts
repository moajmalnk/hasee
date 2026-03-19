import { useEffect } from "react";
import { toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

export function usePwaLifecycle() {
  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onOfflineReady() {
        toast.success("Offline mode is ready.");
      },
      onNeedRefresh() {
        toast.info("A new version is available.", {
          action: {
            label: "Update",
            onClick: () => {
              void updateSW(true);
            },
          },
          duration: 15000,
        });
      },
      onRegisterError(error) {
        console.error("Service worker registration failed", error);
      },
    });

    const onOnline = () => toast.success("You are back online.");
    const onOffline = () => toast.warning("You are offline. Some features may be limited.");

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
}
