import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getWishlistProducts, toggleProductLike } from "@/services/mockApi";
import type { Product } from "@/data/products";
import { ShoppingBag } from "lucide-react";

export default function Wishlist() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await getWishlistProducts();
    setItems(data);
  };

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch {
        toast.error("Failed to load wishlist (mock)");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remove = async (productId: number) => {
    try {
      await toggleProductLike(productId);
      await load();
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist (mock)");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h1 className="text-2xl font-black text-foreground">Wishlist</h1>
          </div>
          <p className="text-sm text-muted-foreground">Your saved maxis (mock).</p>
        </header>

        {loading ? (
          <div className="bg-card border border-border rounded-2xl p-4 text-muted-foreground text-sm" aria-live="polite">
            Loading wishlist...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground text-sm text-center space-y-3">
            <p className="font-bold text-foreground text-sm">Wishlist is empty</p>
            <p className="text-muted-foreground/90">Like a product from its detail page to save it here.</p>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
            >
              <ShoppingBag className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="w-16 h-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">₹{p.price}</p>
                  <p className="text-[10px] text-primary font-bold uppercase mt-1">{p.category}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Link
                    to={`/product/${p.id}`}
                    className="text-xs font-bold text-primary hover:text-primary/90 active:scale-95 transition-transform"
                  >
                    View
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-3"
                    onClick={() => remove(p.id)}
                  >
                    <Heart className="w-4 h-4 mr-1 fill-primary text-primary" strokeWidth={1.5} />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

