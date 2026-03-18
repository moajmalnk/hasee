import AppLayout from '@/components/layout/AppLayout';
import { Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import type { RewardsData } from '@/services/mockApi';
import { getRewardsData } from '@/services/mockApi';
import type { CSSProperties } from 'react';

export default function Rewards() {
  const [data, setData] = useState<RewardsData | null>(null);
  const [flowerParticles, setFlowerParticles] = useState<
    Array<{ id: number; dx: number; dy: number; delay: number; dur: number; rot: number; scale: number; size: number }>
  >([]);
  const [copyBurstId, setCopyBurstId] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getRewardsData();
        setData(res);
      } catch {
        toast.error("Failed to load rewards (mock)");
      }
    })();
  }, []);

  if (!data) {
    return (
      <AppLayout>
        <div className="p-4 text-muted-foreground">Loading rewards (mock)...</div>
      </AppLayout>
    );
  }

  const { referralCount, target, referralLink, leads } = data;
  const progress = (referralCount / target) * 100;

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };
  const addDaysISO = (iso: string, days: number) => new Date(new Date(iso).getTime() + MS_PER_DAY * days).toISOString();

  const triggerCopyBurst = () => {
    setCopyBurstId((v) => v + 1);
    const count = 16;
    const base = Date.now();
    const parts = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const radius = 30 + Math.random() * 70;
      return {
        id: base + i,
        dx: Math.cos(angle) * radius,
        dy: Math.sin(angle) * radius - 10 - Math.random() * 25,
        delay: Math.random() * 0.12,
        dur: 0.9 + Math.random() * 0.35,
        rot: Math.random() * 320 - 160,
        scale: 0.6 + Math.random() * 1.15,
        size: 9 + Math.random() * 12,
      };
    });

    setFlowerParticles(parts);
    window.setTimeout(() => setFlowerParticles([]), 1400);
  };

  const copyLink = () => {
    triggerCopyBurst();
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const shareWhatsApp = () => {
    const text = `Shop the best Maxis at Hasee Maxi! Use my referral link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Hasee Partner</h1>
          <p className="text-muted-foreground text-sm">Earn free Maxis by inviting friends.</p>
        </header>

        {/* Progress Card */}
        <div className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-lg">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-4xl font-black">{referralCount}</span>
              <span className="text-primary-foreground/60 text-lg">/{target}</span>
              <p className="text-xs font-medium uppercase tracking-widest opacity-80">Paid Referrals</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Next Reward:</p>
              <p className="font-bold text-sm">Free Alpine Maxi</p>
            </div>
          </div>
          <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-foreground rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h2 className="font-bold text-sm text-foreground">Your Referral Link</h2>
          <div className="flex gap-2">
            <div className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground truncate font-mono">
              {referralLink}
            </div>
            <div className="relative">
              <button
                onClick={copyLink}
                className="p-2 bg-secondary text-primary rounded-lg active:scale-95 transition-transform"
                aria-label="Copy referral link"
              >
                <Copy className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {flowerParticles.length > 0 && (
                <>
                  <span key={copyBurstId} className="copyBurstRing" />
                  <div className="absolute inset-0 pointer-events-none">
                  {flowerParticles.map((p) => (
                    <span
                      key={p.id}
                      className="flowerParticle"
                      style={
                        {
                          width: p.size,
                          height: p.size,
                          left: "50%",
                          top: "50%",
                          ["--dx"]: `${p.dx}px`,
                          ["--dy"]: `${p.dy}px`,
                          ["--delay"]: `${p.delay}s`,
                          ["--dur"]: `${p.dur}s`,
                          ["--rot"]: `${p.rot}deg`,
                          ["--s"]: `${p.scale}`,
                        } as CSSProperties
                      }
                    />
                  ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <Button variant="whatsapp" className="w-full" onClick={shareWhatsApp}>
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            Share on WhatsApp
          </Button>
        </div>

        {/* Leads Tracker */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/50">
            <h2 className="font-bold text-sm text-foreground">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40">
                <tr>
                  <th className="p-4 pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="p-4 pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="p-4 pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Purchase</th>
                  <th className="p-4 pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Reward</th>
                  <th className="p-4 pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead, i) => {
                  const purchase = formatDate(lead.deliveryDate);
                  const reward =
                    lead.deliveryDate
                      ? lead.status === "Paid"
                        ? `Approved ${formatDate(addDaysISO(lead.deliveryDate, 15))}`
                        : lead.status === "Pending"
                          ? `Unlocks ${formatDate(addDaysISO(lead.deliveryDate, 15))}`
                          : lead.status === "Refunded"
                            ? `Cancelled ${formatDate(addDaysISO(lead.deliveryDate, 15))}`
                            : "—"
                      : "Not delivered yet";

                  const statusClass =
                    lead.status === "Paid"
                      ? "bg-whatsapp/10 text-whatsapp border border-whatsapp/20"
                      : lead.status === "Pending"
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : lead.status === "Refunded"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-muted text-muted-foreground border border-border";

                  return (
                    <tr key={i} className="align-top">
                      <td className="p-4">
                        <div className="font-bold text-foreground truncate max-w-[220px]">{lead.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-muted-foreground font-mono truncate max-w-[150px]">
                          {lead.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-muted-foreground">{purchase}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-muted-foreground">{reward}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center justify-center text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap ${statusClass}`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
