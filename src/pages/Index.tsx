import AppLayout from '@/components/layout/AppLayout';
import ProductCard from '@/components/shop/ProductCard';
import { products } from '@/data/products';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  // "Offer closing soon" is mock-based; we keep it deterministic per page load.
  const offerEndsAtRef = useRef<number>(Date.now() + 1000 * 60 * 60 * 3 + 1000 * 60 * 12); // 3h 12m
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const msLeft = Math.max(0, offerEndsAtRef.current - nowTs);
  const countdown = useMemo(() => {
    const totalSeconds = Math.floor(msLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours,
      minutes,
      seconds,
      closed: msLeft <= 0,
    };
  }, [msLeft]);

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Hero Banner */}
        <div className="bg-primary rounded-3xl p-6 text-primary-foreground">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">New Collection</p>
          <h1 className="text-2xl font-black mt-1">Summer Maxis</h1>
          <p className="text-sm opacity-80 mt-1">Starting from ₹280</p>
        </div>

        {/* Offer Closing Soon */}
        <section className="grid grid-cols-12 gap-3">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card col-span-12">
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Offer closing soon
                </p>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Limited Time
                </span>
              </div>

              <h2 className="text-lg font-black text-foreground">
                Get your Maxi deal before it's gone
              </h2>

              <p className="text-sm text-muted-foreground">
                {countdown.closed ? (
                  <span className="font-bold text-destructive">Offer closed</span>
                ) : (
                  <>
                    Ends in{" "}
                    <span className="font-black text-foreground">
                      {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                <Link
                  to="/sale?offer=1"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-2xl active:scale-[0.98] transition-transform"
                >
                  Shop Offer
                </Link>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/maxi/Alpine%20Breathable%20Maxi.jpg"
                alt=""
                className="w-full h-full object-cover opacity-10"
              />
            </div>
          </div>

          {/* Eid Sale Banner */}
          {/* <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-whatsapp">
                  Eid Sale
                </p>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-whatsapp/10 text-whatsapp">
                  Festive Picks
                </span>
              </div>

              <h2 className="text-lg font-black text-foreground">Elegant Maxis for Eid celebrations</h2>
              <p className="text-sm text-muted-foreground">Browse best sellers and limited-time festive favorites.</p>

              <div className="flex items-center gap-2">
                <Link
                  to="/sale?eid=1"
                  className="inline-flex items-center justify-center bg-whatsapp text-primary-foreground font-bold text-sm px-4 py-2 rounded-2xl active:scale-[0.98] transition-transform"
                >
                  Shop Eid Sale
                </Link>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/maxi/Dubai%20Silk%20Maxi.jpeg"
                alt=""
                className="w-full h-full object-cover opacity-15"
              />
            </div>
          </div> */}
        </section>

        {/* Product Grid */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
