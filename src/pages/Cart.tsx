import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Upload, Copy, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Cart() {
  const [coupon, setCoupon] = useState('');

  const copyUPI = () => {
    navigator.clipboard.writeText('9947428821');
    toast.success('UPI number copied!');
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>

        {/* Cart Item */}
        <div className="bg-card border border-border rounded-2xl p-4 flex gap-4">
          <div className="w-20 h-28 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
            <img src="https://placehold.co/400x600/pink/white?text=Rayon+Maxi" alt="Rayon Maxi" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground">Premium Rayon Maxi</h3>
            <p className="text-xs text-muted-foreground mt-1">Qty: 1</p>
            <p className="text-lg font-bold text-foreground mt-2">₹380</p>
          </div>
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
            <Button size="sm" onClick={() => toast.success('Coupon applied!')}>Apply</Button>
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

        <Button className="w-full h-12 rounded-xl text-base">Place Order — ₹380</Button>
      </div>
    </AppLayout>
  );
}
