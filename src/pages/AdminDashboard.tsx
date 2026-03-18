import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const orders = [
  { id: '#8821', product: 'Rayon Maxi', amount: 380, customer: 'Aisha K.' },
  { id: '#8822', product: 'Dubai Silk Maxi', amount: 550, customer: 'Priya M.' },
  { id: '#8823', product: 'Cotton Maxi', amount: 280, customer: 'Fatima R.' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center">
        <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Revenue', value: '₹42,800' },
            { label: 'Active Leads', value: '54' },
            { label: 'Pending', value: '12' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</p>
              <p className="text-xl font-black text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Verification List */}
        <section className="space-y-3">
          <h2 className="font-bold text-foreground">Order Verification</h2>
          {orders.map((order) => (
            <div key={order.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
              <div className="w-14 h-14 bg-secondary rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground font-bold">Receipt</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{order.id} — {order.customer}</p>
                <p className="text-xs text-muted-foreground">₹{order.amount} • {order.product}</p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-whatsapp hover:bg-whatsapp/10"
                  onClick={() => toast.success(`Order ${order.id} approved`)}
                >
                  <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => toast.error(`Order ${order.id} rejected`)}
                >
                  <XCircle className="w-5 h-5" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
