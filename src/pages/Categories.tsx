import AppLayout from '@/components/layout/AppLayout';
import ProductCard from '@/components/shop/ProductCard';
import { products } from '@/data/products';
import { useState } from 'react';

const categories = ['All', 'Rayon', 'Dubai', 'Cotton', 'Alpine', 'Chiffon', 'Linen'];

export default function Categories() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? products : products.filter(p => p.category === active);

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                active === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
