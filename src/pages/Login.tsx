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

        <div className="bg-secondary/40 border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mock Login Details</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background border border-border rounded-2xl p-3 space-y-1">
              <p className="text-sm font-black text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">
                Email: <span className="font-mono font-bold text-foreground">admin@hasee.com</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Password: <span className="font-mono font-bold text-foreground">admin123</span>
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-3 space-y-1">
              <p className="text-sm font-black text-foreground">Customer</p>
              <p className="text-xs text-muted-foreground">
                Email: <span className="font-mono font-bold text-foreground">user@test.com</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Password: <span className="font-mono font-bold text-foreground">user123</span>
              </p>
            </div>
          </div>
        </div>

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

