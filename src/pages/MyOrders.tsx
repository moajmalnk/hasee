import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getOrders } from "@/services/mockApi";
import type { MockOrder } from "@/services/mockApi";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

function StatusBadge({ status }: { status: MockOrder["status"] }) {
  const className =
    status === "Approved"
      ? "bg-whatsapp/10 text-whatsapp border border-whatsapp/20"
      : status === "Pending"
        ? "bg-warning/10 text-warning border border-warning/20"
        : "bg-muted text-muted-foreground border border-border";

  return (
    <span
      className={`inline-flex items-center justify-center text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap ${className}`}
    >
      {status}
    </span>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h1 className="text-2xl font-black text-foreground">My Orders</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your mock orders and approval status.
          </p>
        </header>

        {loading ? (
          <div
            className="bg-card border border-border rounded-2xl p-4 text-muted-foreground text-sm"
            aria-live="polite"
          >
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground text-sm text-center space-y-3">
            <p className="font-bold text-foreground text-sm">No orders yet</p>
            <p className="text-muted-foreground/90">Browse products and place a mock order to see it here.</p>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Explore categories
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {(() => {
                      const p = products.find((pp) => pp.id === order.productId);
                      if (!p) return null;
                      return (
                        <div className="w-16 h-20 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      );
                    })()}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-foreground truncate">{order.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.id} • {order.customer}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Order amount</span>
                  <span className="font-black text-foreground">₹{order.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

