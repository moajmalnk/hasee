import { useState } from 'react';
import { CheckCircle, XCircle, Star, TrendingUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockReviews } from '@/data/mockData';
import { products } from '@/data/products';
import { productLikes } from '@/data/mockData';

const orders = [
  { id: '#8821', product: 'Rayon Maxi', amount: 380, customer: 'Aisha K.' },
  { id: '#8822', product: 'Dubai Silk Maxi', amount: 550, customer: 'Priya M.' },
  { id: '#8823', product: 'Cotton Maxi', amount: 280, customer: 'Fatima R.' },
];

const tabs = ['Orders', 'Reviews', 'Analytics'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Orders');
  const [reviews, setReviews] = useState(mockReviews);

  const pendingReviews = reviews.filter(r => !r.approved);
  const approvedReviews = reviews.filter(r => r.approved);

  const approveReview = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
    toast.success('Review approved');
  };

  const deleteReview = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.error('Review deleted');
  };

  const sortedByLikes = [...products].sort((a, b) => (productLikes[b.id] || 0) - (productLikes[a.id] || 0));

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
            { label: 'Pending', value: String(pendingReviews.length + 12) },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</p>
              <p className="text-xl font-black text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'Orders' && (
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
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-whatsapp hover:bg-whatsapp/10" onClick={() => toast.success(`Order ${order.id} approved`)}>
                    <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => toast.error(`Order ${order.id} rejected`)}>
                    <XCircle className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Reviews Tab */}
        {activeTab === 'Reviews' && (
          <section className="space-y-4">
            {pendingReviews.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-bold text-foreground">Pending Approval ({pendingReviews.length})</h2>
                {pendingReviews.map(review => (
                  <div key={review.id} className="bg-card border-2 border-warning/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">{review.userName}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="rounded-xl text-xs font-bold flex-1" onClick={() => approveReview(review.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="rounded-xl text-xs font-bold flex-1" onClick={() => deleteReview(review.id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h2 className="font-bold text-foreground">Approved Reviews ({approvedReviews.length})</h2>
              {approvedReviews.map(review => (
                <div key={review.id} className="bg-card border border-border rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{review.userName}</p>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteReview(review.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} strokeWidth={1.5} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Analytics Tab */}
        {activeTab === 'Analytics' && (
          <section className="space-y-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1.5} />
              Most Liked Products
            </h2>
            {sortedByLikes.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <span className="text-lg font-black text-primary w-7 text-center">#{i + 1}</span>
                <img src={product.image} alt={product.name} className="w-12 h-16 rounded-lg object-cover bg-secondary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">₹{product.price}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-primary text-primary" strokeWidth={1.5} />
                  <span className="text-sm font-bold text-foreground">{productLikes[product.id] || 0}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
