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
                          ["--dx" as any]: `${p.dx}px`,
                          ["--dy" as any]: `${p.dy}px`,
                          ["--delay" as any]: `${p.delay}s`,
                          ["--dur" as any]: `${p.dur}s`,
                          ["--rot" as any]: `${p.rot}deg`,
                          ["--s" as any]: `${p.scale}`,
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
          <div className="divide-y divide-border">
            {leads.map((lead, i) => (
              <div key={i} className="p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground font-mono">{lead.phone}</span>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    lead.status === 'Paid'
                      ? 'bg-whatsapp/10 text-whatsapp'
                      : lead.status === 'Pending'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
