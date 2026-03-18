import AppLayout from '@/components/layout/AppLayout';
import ProductCard from '@/components/shop/ProductCard';
import { products } from '@/data/products';

const Index = () => {
  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Hero Banner */}
        <div className="bg-primary rounded-3xl p-6 text-primary-foreground">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">New Collection</p>
          <h1 className="text-2xl font-black mt-1">Summer Maxis</h1>
          <p className="text-sm opacity-80 mt-1">Starting from ₹280</p>
        </div>

        {/* Product Grid */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Trending Now</h2>
          <div className="grid grid-cols-2 gap-3">
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
