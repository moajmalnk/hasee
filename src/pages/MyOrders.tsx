import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getOrders } from "@/services/mockApi";
import type { MockOrder } from "@/services/mockApi";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, Package, ShoppingBag, Truck, XCircle } from "lucide-react";

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

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

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

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tracking</p>
                    <p className="text-sm font-bold text-foreground truncate">{order.trackingCode}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Expected delivery</p>
                    <p className="text-sm font-bold text-foreground">{formatDate(order.expectedDeliveryAt)}</p>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-2xl p-3">
                  {(() => {
                    const expectedTs = new Date(order.expectedDeliveryAt).getTime();
                    const delivered = order.status === "Approved" && Date.now() >= expectedTs;

                    const steps = [
                      {
                        key: "placed",
                        label: "Order placed",
                        done: true,
                        Icon: Clock3,
                      },
                      {
                        key: "approved",
                        label: "Approved",
                        done: order.status === "Approved",
                        Icon: CheckCircle2,
                      },
                      {
                        key: "delivered",
                        label: delivered ? "Delivered" : order.status === "Approved" ? "In delivery" : "Cancelled",
                        done: delivered,
                        Icon: order.status === "Rejected" ? XCircle : Truck,
                      },
                    ] as const;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {steps.map((s, idx) => (
                            <div key={s.key} className="flex items-center gap-2 min-w-0">
                              <s.Icon
                                className={`w-4 h-4 ${
                                  s.done ? "text-whatsapp" : "text-muted-foreground"
                                }`}
                                strokeWidth={1.8}
                              />
                              <p className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                                {s.label}
                              </p>
                              {idx !== steps.length - 1 && (
                                <div className="h-px flex-1 bg-border" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                          <span>Placed on: {formatDate(order.createdAt)}</span>
                          {order.status === "Rejected" ? (
                            <span className="text-destructive font-bold">Payment/Verification rejected</span>
                          ) : delivered ? (
                            <span className="text-whatsapp font-bold">Delivered successfully</span>
                          ) : (
                            <span className="font-bold">ETA: {formatDate(order.expectedDeliveryAt)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

