import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Copy, Ticket, Upload, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import type { MockCartItem } from "@/services/mockApi";
import { adjustCartItem, applyCouponCode, getCart, getSession, placeOrder } from "@/services/mockApi";
import * as qrcode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Cart() {
  const location = useLocation();
  const navigate = useNavigate();
  const autoPlaceOrderRequested = useMemo(() => {
    return new URLSearchParams(location.search).get("placeOrder") === "1";
  }, [location.search]);
  const autoPlacedRef = useRef(false);
  const [coupon, setCoupon] = useState("");
  const [cartItems, setCartItems] = useState<MockCartItem[]>([]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLabel, setCouponLabel] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [adjustingKey, setAdjustingKey] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MockCartItem | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ file: File; previewUrl?: string } | null>(null);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string | null>(null);

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

  const upiId = "9947428821";
  const upiName = "Hasee Maxi";
  const upiNote = "Hasee Maxi Order";
  const upiCurrency = "INR";

  const upiPayUri = useMemo(() => {
    const amount = Math.max(0, total).toFixed(2);
    const refUrl = `${window.location.origin}/cart?payment=upi`;
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      upiName,
    )}&am=${amount}&cu=${upiCurrency}&tn=${encodeURIComponent(upiNote)}&refUrl=${encodeURIComponent(refUrl)}`;
  }, [total]);

  useEffect(() => {
    let cancelled = false;
    void qrcode
      .toDataURL(upiPayUri, { margin: 1, width: 180, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setUpiQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setUpiQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [upiPayUri]);

  useEffect(() => {
    const payment = new URLSearchParams(location.search).get("payment");
    if (payment) {
      toast.success("Payment flow opened. Upload your receipt and place the order.");
    }
  }, [location.search]);

  useEffect(() => {
    if (!couponLabel || !coupon) return;
    void (async () => {
      try {
        const res = await applyCouponCode({ code: coupon, subtotal });
        if (res.ok) setCouponDiscount(res.discount);
        else {
          setCouponDiscount(0);
          setCouponLabel(null);
        }
      } catch {
        setCouponDiscount(0);
        setCouponLabel(null);
      }
    })();
  }, [cartItems, coupon, couponLabel, subtotal]);

  useEffect(() => {
    return () => {
      if (receipt?.previewUrl) URL.revokeObjectURL(receipt.previewUrl);
    };
  }, [receipt?.previewUrl]);

  const onReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB max (matches UI hint)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max 5MB allowed.");
      return;
    }

    if (receipt?.previewUrl) URL.revokeObjectURL(receipt.previewUrl);

    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

    setReceipt({ file, previewUrl });
    toast.success("Payment Screenshot Uploaded");
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI number copied!');
  };

  const payViaUpi = () => {
    // Opens the user's UPI app (Google Pay/PhonePe/etc.) for the payment flow.
    window.location.href = upiPayUri;
  };

  const applyCoupon = async () => {
    const res = await applyCouponCode({ code: coupon, subtotal });
    if (res.ok) {
      setCouponDiscount(res.discount);
      setCouponLabel(res.label);
      setCouponError(null);
      toast.success(`Coupon applied: ${res.label}`);
      return;
    }
    setCouponDiscount(0);
    setCouponLabel(null);
    setCouponError((res as { message: string }).message);
  };

  const adjustQty = async (item: MockCartItem, delta: number) => {
    const key = `${item.productId}:${item.size}`;
    if (adjustingKey === key) return;
    setAdjustingKey(key);
    try {
      const items = await adjustCartItem({ productId: item.productId, size: item.size, delta });
      setCartItems(items);
    } catch {
      toast.error("Failed to update cart (mock)");
    } finally {
      setAdjustingKey(null);
    }
  };

  const requestDeleteItem = (item: MockCartItem) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!deleteTarget) return;
    const key = `${deleteTarget.productId}:${deleteTarget.size}`;
    setDeletingKey(key);
    try {
      const items = await adjustCartItem({
        productId: deleteTarget.productId,
        size: deleteTarget.size,
        delta: -deleteTarget.qty,
      });
      setCartItems(items);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item (mock)");
    } finally {
      setDeletingKey(null);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const onPlaceOrder = async () => {
    const session = await getSession();
    const returnToCartWithPlaceOrderFlag = "/cart?placeOrder=1";

    if (!session.loggedIn) {
      // Ensure we auto-place after login + onboarding.
      navigate(`/login?next=${encodeURIComponent(returnToCartWithPlaceOrderFlag)}`);
      return;
    }
    if (!session.onboardingComplete) {
      // Go to onboarding once; on completion we return here and auto-place the order.
      navigate(`/onboarding?next=${encodeURIComponent(returnToCartWithPlaceOrderFlag)}`);
      return;
    }

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
      navigate("/my-orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order (mock)");
    } finally {
      setPlacing(false);
    }
  };

  useEffect(() => {
    if (!autoPlaceOrderRequested) return;
    if (autoPlacedRef.current) return;
    if (cartItems.length === 0) return;
    if (placing) return;
    autoPlacedRef.current = true;
    void onPlaceOrder();
  }, [autoPlaceOrderRequested, cartItems.length, placing]);

  return (
    <>
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
                      Size: {item.size}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => void adjustQty(item, -1)}
                          disabled={adjustingKey === `${item.productId}:${item.size}`}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" strokeWidth={1.5} />
                        </Button>

                        <span className="w-8 text-center font-bold text-foreground">
                          {item.qty}
                        </span>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => void adjustQty(item, +1)}
                          disabled={adjustingKey === `${item.productId}:${item.size}`}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => requestDeleteItem(item)}
                          disabled={deletingKey === `${item.productId}:${item.size}` || deletingKey != null}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>

                        <p className="text-lg font-bold text-foreground">₹{p.price * item.qty}</p>
                      </div>
                    </div>
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
              onChange={(e) => {
                setCoupon(e.target.value);
                setCouponError(null);
              }}
              placeholder="Enter code"
              className="flex-1 bg-secondary border-0 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="sm" onClick={applyCoupon}>Apply</Button>
          </div>

          {couponError && <div className="text-xs text-destructive font-bold pt-1">{couponError}</div>}

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

          <div className="flex items-start justify-between gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Official Merchant Number</p>
                  <p className="text-xl font-mono font-bold text-foreground">{upiId}</p>
                </div>
                <button
                  onClick={copyUPI}
                  className="text-primary text-sm font-bold active:scale-95 transition-transform"
                  aria-label="Copy UPI ID"
                >
                  <Copy className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl h-11 font-bold"
                    onClick={payViaUpi}
                    type="button"
                  >
                    Pay with GPay
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl h-11 font-bold"
                    onClick={payViaUpi}
                    type="button"
                  >
                    Pay with PhonePe
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  After payment, you can return here (best-effort via UPI) to upload your receipt and place the order.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 w-[104px] md:w-[120px]">
              {upiQrDataUrl ? (
                <img
                  src={upiQrDataUrl}
                  alt="UPI payment QR code"
                  className="w-full h-full rounded-xl border border-border bg-background p-1"
                />
              ) : (
                <div className="w-full aspect-square rounded-xl border border-border bg-background flex items-center justify-center text-[10px] text-muted-foreground">
                  QR...
                </div>
              )}
            </div>
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
            <input
              type="file"
              className="hidden"
              id="receipt-upload"
              accept="image/*,.pdf"
              onChange={onReceiptChange}
            />
          <label
            htmlFor="receipt-upload"
            className="w-full py-3 bg-card text-primary border border-primary rounded-xl text-center font-bold text-sm cursor-pointer active:scale-95 transition-transform duration-200"
          >
            Choose Screenshot
          </label>

          {receipt && (
            <div className="w-full pt-2">
              {receipt.previewUrl ? (
                <div className="rounded-xl border border-border overflow-hidden bg-background">
                  <img
                    src={receipt.previewUrl}
                    alt={receipt.file.name}
                    className="w-full h-40 object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background p-3 text-center text-sm text-foreground font-bold">
                  {receipt.file.name}
                </div>
              )}
            </div>
          )}
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

      {/* Remove confirmation popup */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">Remove item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove the selected item from your cart.
          </p>
          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-bold"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
                setDeletingKey(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl font-bold"
              onClick={() => void confirmDeleteItem()}
              disabled={!deleteTarget || deletingKey != null}
            >
              {deletingKey ? "Removing..." : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
