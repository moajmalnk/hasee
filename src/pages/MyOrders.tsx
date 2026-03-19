import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getOrders } from "@/services/mockApi";
import type { MockOrder } from "@/services/mockApi";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, Package, ShoppingBag, Truck, XCircle } from "lucide-react";

function OrderBill({
  order,
  product,
}: {
  order: MockOrder;
  product: (typeof products)[number] | undefined;
}) {
  const logoSrc = "/favicon.ico";
  const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const expectedDelivery = new Date(order.expectedDeliveryAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="bg-secondary/30 border border-border rounded-2xl overflow-hidden">
      {/* Letterhead */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logoSrc} alt="Hasee Maxi logo" className="w-10 h-10 rounded-lg bg-background p-1" />
            <div className="min-w-0">
              <p className="text-lg font-black text-foreground leading-tight truncate">Hasee Maxi</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">
                Premium Maxi Dresses • Rayon • Dubai Silk
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Invoice</p>
            <p className="text-sm font-black text-foreground mt-1">{order.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Bill To</p>
            <p className="text-sm font-bold text-foreground mt-1">{order.customer}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Order Details</p>
            <p className="text-sm font-bold text-foreground mt-1">
              Date: {orderDate}
            </p>
          </div>
        </div>
      </div>

      {/* Bill body */}
      <div className="px-4 py-3 space-y-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Items</p>
          <div className="bg-card border border-border rounded-xl p-3 space-y-0.5">
            {(order.items?.length ? order.items : [{ productId: order.productId, name: order.productName, qty: 1, unitPrice: order.amount, total: order.amount, category: product?.category }]).map((it) => (
              <div key={`${it.productId}:${it.name}`} className="flex items-start justify-between gap-3 py-2 border-b border-border/60 last:border-b-0">
                <div className="min-w-0">
                  <p className="text-sm font-black text-foreground truncate">{it.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {it.qty} • Category: {it.category ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Amount</p>
                  <p className="text-base font-black text-foreground mt-1">₹{it.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Tracking</p>
            <p className="text-sm font-black text-foreground mt-1 truncate">{order.trackingCode}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Expected Delivery</p>
            <p className="text-sm font-black text-foreground mt-1">{expectedDelivery}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-sm font-bold text-muted-foreground">Total</p>
          <p className="text-lg font-black text-foreground">₹{order.amount}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Payment status</span>
          <span className="font-bold text-foreground">
            {order.status === "Rejected" ? "Cancelled" : order.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: MockOrder["status"] }) {
  const label = status === "Rejected" ? "Cancelled" : status;
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
      {label}
    </span>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Cancelled">("Pending");

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

  const handlePrint = (orderId: string) => {
    setPrintOrderId(orderId);
    window.addEventListener(
      "afterprint",
      () => {
        setPrintOrderId(null);
      },
      { once: true },
    );
    // Let React update DOM visibility before opening the print dialog.
    window.setTimeout(() => {
      window.print();
    }, 50);
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

  const visibleOrders = orders.filter((o) => {
    if (activeTab === "Cancelled") return o.status === "Rejected";
    return o.status === activeTab;
  });

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
        <header className="space-y-1 no-print">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h1 className="text-2xl font-black text-foreground">My Orders</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your mock orders and approval status.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 pt-2">
            {(["Pending", "Approved", "Cancelled"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-xs sm:text-sm font-bold py-2 rounded-xl transition-transform active:scale-[0.98] ${
                    isActive
                      ? tab === "Approved"
                        ? "bg-whatsapp text-primary-foreground"
                        : tab === "Pending"
                          ? "bg-warning text-warning-foreground"
                          : "bg-muted text-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tab === "Pending" ? "Pendings" : tab}
                </button>
              );
            })}
          </div>
        </header>

        {loading ? (
          <div
            className="bg-card border border-border rounded-2xl p-4 text-muted-foreground text-sm"
            aria-live="polite"
          >
            Loading orders...
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground text-sm text-center space-y-3 no-print">
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
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-4 space-y-3"
                style={printOrderId && order.id !== printOrderId ? { display: "none" } : undefined}
              >
                <div className="no-print space-y-3">
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
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        Tracking
                      </p>
                      <p className="text-sm font-bold text-foreground truncate">{order.trackingCode}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        Expected delivery
                      </p>
                      <p className="text-sm font-bold text-foreground">{formatDate(order.expectedDeliveryAt)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handlePrint(order.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-muted text-foreground hover:bg-muted/80 active:scale-[0.98] transition-transform"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrint(order.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-transform"
                    >
                      Print
                    </button>
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
                          label: delivered
                            ? "Delivered"
                            : order.status === "Approved"
                              ? "In delivery"
                              : "Cancelled",
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
                                  className={`w-4 h-4 ${s.done ? "text-whatsapp" : "text-muted-foreground"}`}
                                  strokeWidth={1.8}
                                />
                                <p className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                                  {s.label}
                                </p>
                                {idx !== steps.length - 1 && <div className="h-px flex-1 bg-border" />}
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

                <OrderBill order={order} product={products.find((pp) => pp.id === order.productId)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

