import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, MessageCircle, ShoppingCart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { RewardsData } from "@/services/mockApi";
import { getCart, getRewardsData, type MockCartItem } from "@/services/mockApi";
import { Button } from "@/components/ui/button";

function StatusBadge({ status }: { status: "Paid" | "Pending" | "Clicked" | "Refunded" }) {
  const className =
    status === "Paid"
      ? "bg-whatsapp/10 text-whatsapp"
      : status === "Pending"
        ? "bg-warning/10 text-warning"
        : status === "Refunded"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";

  return (
    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${className}`}>
      {status}
    </span>
  );
}

export default function StickyHeader() {
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getRewardsData();
        setRewards(data);
      } catch {
        // If mock rewards fail, keep header usable.
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchCartCount = async () => {
      try {
        const items: MockCartItem[] = await getCart();
        const total = items.reduce((sum, it) => sum + (it.qty ?? 0), 0);
        if (!cancelled) setCartCount(total);
      } catch {
        // Keep header usable if mock cart fails.
        if (!cancelled) setCartCount(0);
      }
    };

    // Initial load.
    void fetchCartCount();

    // Keep the header in sync when cart changes on other pages.
    const interval = window.setInterval(() => {
      void fetchCartCount();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const openWhatsApp = () => {
    window.open('https://wa.me/919947428821?text=Hi! I need help with Hasee Maxi.', '_blank');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 max-w-5xl mx-auto w-full">
        <Link to="/" aria-label="Go to home" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-black">H</span>
          </div>
          <span className="text-lg font-bold text-foreground">Hasee</span>
        </Link>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="max-w-[190px] h-10 px-3 rounded-full bg-secondary border border-border flex items-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
                aria-label="Reward history"
              >
                <Gift className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-[11px] font-extrabold text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  Refer & earn up to ₹1999
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="rounded-2xl w-72">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Reward History
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {rewards ? `${rewards.referralCount}/${rewards.target} refs` : "Loading..."}
                    </p>
                  </div>
                  <Link to="/rewards" className="text-xs font-bold text-primary hover:text-primary/90">
                    Open
                  </Link>
                </div>

                <div className="space-y-2">
                  {(rewards?.leads ?? []).slice(0, 4).map((lead, idx) => (
                    <div key={`${lead.phone}:${idx}`} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground font-mono truncate flex-1">
                        {lead.phone}
                      </span>
                      <StatusBadge status={lead.status} />
                    </div>
                  ))}
                  {rewards && rewards.leads.length === 0 && (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  )}
                  {!rewards && <p className="text-sm text-muted-foreground">Loading...</p>}
                </div>

                <div className="bg-secondary rounded-xl p-3 border border-border">
                  <p className="text-xs font-bold text-foreground">Promote with our app</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Invite friends and earn free Maxis. Use Hasee Maxi regularly to unlock more rewards.
                  </p>
                </div>

                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link to="/rewards">See rewards</Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {cartCount > 0 ? (
            <Link
              to="/cart"
              aria-label={`Cart: ${cartCount} item(s)`}
              className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-200"
            >
              <ShoppingCart className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-background border border-border text-[10px] font-extrabold flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </Link>
          ) : (
            <button
              onClick={openWhatsApp}
              className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-200"
            >
              <MessageCircle className="w-5 h-5 text-whatsapp-foreground" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
