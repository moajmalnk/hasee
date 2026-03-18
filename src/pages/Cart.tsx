import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Copy, Ticket, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import type { MockCartItem } from "@/services/mockApi";
import { applyCouponCode, getCart, placeOrder } from "@/services/mockApi";

export default function Cart() {
  const [coupon, setCoupon] = useState("");
  const [cartItems, setCartItems] = useState<MockCartItem[]>([]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLabel, setCouponLabel] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const items = await getCart();
        setCartItems(items);
      } catch {
        toast.error("Failed to load cart (mock)");
      }
    })();
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const p = products.find((pp) => pp.id === item.productId);
      return sum + (p?.price ?? 0) * item.qty;
    }, 0);
  }, [cartItems]);

  const total = useMemo(() => Math.max(0, subtotal - couponDiscount), [subtotal, couponDiscount]);

  const copyUPI = () => {
    navigator.clipboard.writeText('9947428821');
    toast.success('UPI number copied!');
  };

  const applyCoupon = async () => {
    const res = await applyCouponCode({ code: coupon, subtotal });
    if (res.ok) {
      setCouponDiscount(res.discount);
      setCouponLabel(res.label);
      toast.success(`Coupon applied: ${res.label}`);
      return;
    }
    setCouponDiscount(0);
    setCouponLabel(null);
    toast.error((res as { message: string }).message);
  };

  const onPlaceOrder = async () => {
    setPlacing(true);
    setLastOrderId(null);
    try {
      const res = await placeOrder({ couponCode: couponLabel ? coupon : undefined });
      setLastOrderId(res.id);
      setCoupon("");
      setCouponDiscount(0);
      setCouponLabel(null);

      setCartItems(await getCart());
      toast.success(`Order placed: ${res.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order (mock)");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>

        {/* Cart Items */}
        <div className="space-y-3">
          {cartItems.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-4 text-center text-muted-foreground text-sm">
              Cart is empty (mock). Place an order to see it in Admin Dashboard.
            </div>
          ) : (
            cartItems.map((item) => {
              const p = products.find((pp) => pp.id === item.productId);
              if (!p) return null;
              return (
                <div key={`${item.productId}:${item.size}`} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
                  <div className="w-20 h-28 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Qty: {item.qty} • Size: {item.size}
                    </p>
                    <p className="text-lg font-bold text-foreground mt-2">₹{p.price * item.qty}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Coupon */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h2 className="font-bold text-sm text-foreground">Coupon Code</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter code"
              className="flex-1 bg-secondary border-0 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="sm" onClick={applyCoupon}>Apply</Button>
          </div>

          {couponLabel && (
            <div className="text-xs text-muted-foreground pt-1">
              Discount: <span className="font-bold text-foreground">₹{couponDiscount}</span> • {couponLabel}
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-muted rounded-2xl p-4 border border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-bold text-foreground">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-black text-foreground text-lg">₹{total}</span>
          </div>
        </div>

        {/* Offline Payment */}
        <div className="bg-muted rounded-2xl p-4 border-2 border-dashed border-border space-y-2">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Step 1: Pay via GPay/PhonePe</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Official Merchant Number</p>
              <p className="text-xl font-mono font-bold text-foreground">9947428821</p>
            </div>
            <button onClick={copyUPI} className="text-primary text-sm font-bold active:scale-95 transition-transform">
              <Copy className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Receipt Upload */}
        <div className="bg-secondary rounded-2xl border border-border p-6 flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm">
            <Upload className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm text-foreground">Upload Payment Receipt</p>
            <p className="text-[10px] text-muted-foreground">PNG, JPG or PDF (Max 5MB)</p>
          </div>
          <input type="file" className="hidden" id="receipt-upload" accept="image/*,.pdf" />
          <label
            htmlFor="receipt-upload"
            className="w-full py-3 bg-card text-primary border border-primary rounded-xl text-center font-bold text-sm cursor-pointer active:scale-95 transition-transform duration-200"
          >
            Choose Screenshot
          </label>
        </div>

        {lastOrderId && (
          <div className="text-center text-sm text-muted-foreground">
            Last order: <span className="font-bold text-foreground">{lastOrderId}</span> (Pending in Admin)
          </div>
        )}

        <Button
          className="w-full h-12 rounded-xl text-base"
          onClick={onPlaceOrder}
          disabled={placing || cartItems.length === 0}
        >
          {placing ? "Placing..." : `Place Order — ₹${total}`}
        </Button>
      </div>
    </AppLayout>
  );
}
