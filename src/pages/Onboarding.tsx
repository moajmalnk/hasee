import AppLayout from "@/components/layout/AppLayout";
import { OnboardingForm } from "@/components/forms/OnboardingForm";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { completeOnboarding, getSession } from "@/services/mockApi";
import { useEffect } from "react";

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") ?? "/";

  useEffect(() => {
    void (async () => {
      const s = await getSession().catch(() => null);
      if (!s?.loggedIn) {
        navigate(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      // Admins don't need onboarding.
      if (s?.role === "ADMIN") {
        navigate(next);
        return;
      }
      // Customers should only see onboarding if not completed yet.
      if (s?.onboardingComplete) {
        navigate(next);
      }
    })();
  }, [navigate, next]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
        <header className="space-y-1">
          <h1 className="text-2xl font-black text-foreground">Onboarding</h1>
          <p className="text-sm text-muted-foreground">Complete your details to continue.</p>
        </header>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
          <OnboardingForm
            onSubmit={async (values) => {
              await completeOnboarding(values);
              toast.success("Onboarding saved");
              navigate(next);
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}

