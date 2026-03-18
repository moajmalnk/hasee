import AppLayout from '@/components/layout/AppLayout';
import { Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const leads = [
  { phone: '9947xxxx21', status: 'Paid' },
  { phone: '9876xxxx43', status: 'Pending' },
  { phone: '8765xxxx12', status: 'Paid' },
  { phone: '7654xxxx89', status: 'Clicked' },
  { phone: '9123xxxx56', status: 'Pending' },
  { phone: '8912xxxx34', status: 'Paid' },
];

export default function Rewards() {
  const referralCount = 6;
  const target = 10;
  const progress = (referralCount / target) * 100;
  const referralLink = 'https://hasee.in/ref/USR001';

  const copyLink = () => {
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
            <button onClick={copyLink} className="p-2 bg-secondary text-primary rounded-lg active:scale-95 transition-transform">
              <Copy className="w-4 h-4" strokeWidth={1.5} />
            </button>
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
