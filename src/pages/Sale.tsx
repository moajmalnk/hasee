import AppLayout from '@/components/layout/AppLayout';
import ProductCard from '@/components/shop/ProductCard';
import { products } from '@/data/products';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Sale() {
  const [params] = useSearchParams();

  const mode = useMemo(() => {
    if (params.get('eid') === '1') return 'Eid Sale';
    if (params.get('offer') === '1') return 'Limited Offer';
    return 'Sale';
  }, [params]);

  const subtitle = useMemo(() => {
    if (mode === 'Eid Sale') return 'Festive picks to celebrate in style.';
    if (mode === 'Limited Offer') return 'Limited-time favorites available now.';
    return 'Browse our best-value maxi picks.';
  }, [mode]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto">
        <header className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">{mode}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <div className="flex items-center gap-2 pt-2">
            <Link
              to="/categories"
              className="text-sm font-bold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              View all categories
            </Link>
          </div>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

