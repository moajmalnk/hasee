import AppLayout from "@/components/layout/AppLayout";
import { LoginForm } from "@/components/forms/LoginForm";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { getSession, login } from "@/services/mockApi";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") ?? "/";

  useEffect(() => {
    void (async () => {
      try {
        const s = await getSession();
        if (!s.loggedIn) return;
        if (s.onboardingComplete) navigate(next);
        else navigate(`/onboarding?next=${encodeURIComponent(next)}`);
      } catch {
        // ignore (mock)
      }
    })();
  }, [navigate, next]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
        <header className="space-y-1">
          <h1 className="text-2xl font-black text-foreground">Login</h1>
          <p className="text-sm text-muted-foreground">
            Login using mock credentials for testing role + onboarding.
          </p>
        </header>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
          <LoginForm
            onLogin={async (input) => {
              await login(input);
              toast.success("Login Successful");
              navigate(`/onboarding?next=${encodeURIComponent(next)}`);
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}

