import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RewardsData } from "@/services/mockApi";
import { getRewardsData, getSession } from "@/services/mockApi";

export default function ClaimReward() {
  const navigate = useNavigate();
  const [data, setData] = useState<RewardsData | null>(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    void (async () => {
      const s = await getSession();
      if (!s.loggedIn) {
        navigate(`/login?next=${encodeURIComponent("/claim-reward")}`);
        return;
      }
      if (!s.onboardingComplete) {
        navigate(`/onboarding?next=${encodeURIComponent("/claim-reward")}`);
        return;
      }
      if (s.role && s.role !== "CUSTOMER") {
        toast.error("Only customers can claim rewards.");
        navigate("/admin/dashboard");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getRewardsData();
        setData(res);
      } catch {
        toast.error("Failed to load reward progress (mock)");
      }
    })();
  }, []);

  const progressPct = useMemo(() => {
    if (!data) return 0;
    return (data.referralCount / data.target) * 100;
  }, [data]);

  const canClaim = Boolean(data && data.referralCount >= data.target) && !claimed;

  const onClaim = () => {
    if (!data) return;
    if (data.referralCount < data.target) return;
    setClaimed(true);
    toast.success("Reward claimed! (mock)");
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
        <header className="space-y-1">
          <h1 className="text-2xl font-black text-foreground">Claim Reward</h1>
          <p className="text-sm text-muted-foreground">Your reward unlocks once the 10-paid target is reached.</p>
        </header>

        {!data ? (
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 text-sm text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-lg">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-4xl font-black">{data.referralCount}</span>
                  <span className="text-primary-foreground/60 text-lg">/{data.target}</span>
                  <p className="text-xs font-medium uppercase tracking-widest opacity-80">Paid Referrals</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">Progress</p>
                  <p className="font-bold text-sm">{Math.round(progressPct)}%</p>
                </div>
              </div>
              <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-foreground rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                {canClaim
                  ? "You are eligible. Claim your reward now."
                  : `Keep going: claim unlocks when you reach ${data.target} paid referrals.`}
              </p>

              <Button className="w-full h-12 rounded-xl font-bold" disabled={!canClaim} onClick={onClaim}>
                {claimed ? "Claimed" : `Claim Reward`}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

