import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Star, TrendingUp, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { products } from '@/data/products';
import type { Review } from '@/data/mockData';
import type { MockOrder, RewardsData } from '@/services/mockApi';
import {
  approveOrder,
  approveReview as mockApproveReview,
  deleteReview as mockDeleteReview,
  getAllReviews,
  getRewardsData,
  getOrders,
  getProductLikeCounts,
  rejectOrder,
  setLeadRefunded,
} from '@/services/mockApi';

const tabs = ['Orders', 'Reviews', 'Analytics', 'Refunds'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Orders');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [productLikeCounts, setProductLikeCounts] = useState<Record<number, number>>({});
  const [rewards, setRewards] = useState<RewardsData | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [allReviews, allOrders, likeCounts, rewardsRes] = await Promise.all([
          getAllReviews(),
          getOrders(),
          getProductLikeCounts(),
          getRewardsData(),
        ]);
        setReviews(allReviews);
        setOrders(allOrders);
        setProductLikeCounts(likeCounts);
        setRewards(rewardsRes);
      } catch {
        toast.error("Failed to load admin dashboard data (mock)");
      }
    })();
  }, []);

  const pendingReviews = reviews.filter(r => !r.approved);
  const approvedReviews = reviews.filter(r => r.approved);

  const approveReview = async (id: number) => {
    await mockApproveReview(id);
    toast.success('Review approved');
    setReviews(await getAllReviews());
  };

  const deleteReview = async (id: number) => {
    await mockDeleteReview(id);
    toast.error('Review deleted');
    setReviews(await getAllReviews());
  };

  const sortedByLikes = useMemo(() => {
    return [...products].sort((a, b) => (productLikeCounts[b.id] || 0) - (productLikeCounts[a.id] || 0));
  }, [productLikeCounts]);

  const onApproveOrder = async (orderId: string) => {
    await approveOrder(orderId);
    toast.success(`Order ${orderId} approved`);
    setOrders(await getOrders());
  };

  const onRejectOrder = async (orderId: string) => {
    await rejectOrder(orderId);
    toast.error(`Order ${orderId} rejected`);
    setOrders(await getOrders());
  };

  const refreshRewards = async () => {
    const res = await getRewardsData();
    setRewards(res);
  };

  const onToggleRefund = async (phone: string, refunded: boolean) => {
    await setLeadRefunded(phone, refunded);
    toast.success(refunded ? "Lead marked as refunded" : "Refund removed");
    await refreshRewards();
  };

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
            {orders.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-4 text-center text-muted-foreground text-sm">
                No orders yet (mock).
              </div>
            ) : (
              orders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-14 h-14 bg-secondary rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-bold">Receipt</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{order.id} — {order.customer}</p>
                  <p className="text-xs text-muted-foreground">₹{order.amount} • {order.productName}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-whatsapp hover:bg-whatsapp/10"
                    onClick={() => onApproveOrder(order.id)}
                    disabled={order.status === 'Approved'}
                  >
                    <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => onRejectOrder(order.id)}
                    disabled={order.status === 'Rejected'}
                  >
                    <XCircle className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
              ))
            )}
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
                  <span className="text-sm font-bold text-foreground">{productLikeCounts[product.id] || 0}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Refunds Tab */}
        {activeTab === 'Refunds' && (
          <section className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="font-bold text-foreground">Refund Tracker</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Progress recalculates from computed paid referrals (Paid excludes Refunded).
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Paid Progress</p>
                  <p className="text-xl font-black text-foreground mt-1">
                    {rewards ? `${rewards.referralCount}/${rewards.target}` : 'Loading...'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Refunded Members</p>
                  <p className="text-xl font-black text-foreground mt-1">
                    {rewards ? rewards.leads.filter((l) => l.status === 'Refunded').length : 0}
                  </p>
                </div>
              </div>
            </div>

            {!rewards ? (
              <div className="bg-card border border-border rounded-2xl p-4 text-muted-foreground text-sm text-center">
                Loading refunds...
              </div>
            ) : (
              <div className="space-y-2">
                {rewards.leads.map((lead) => (
                  <div
                    key={lead.phone}
                    className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{lead.phone}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.status}
                        {lead.deliveryDate ? ` • delivered: ${new Date(lead.deliveryDate).toLocaleDateString()}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap ${
                          lead.status === 'Paid'
                            ? 'bg-whatsapp/10 text-whatsapp border border-whatsapp/20'
                            : lead.status === 'Pending'
                              ? 'bg-warning/10 text-warning border border-warning/20'
                              : lead.status === 'Refunded'
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {lead.status}
                      </span>

                      {lead.status === 'Paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs font-bold"
                          onClick={() => void onToggleRefund(lead.phone, true)}
                        >
                          Mark Refunded
                        </Button>
                      )}

                      {lead.status === 'Refunded' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs font-bold"
                          onClick={() => void onToggleRefund(lead.phone, false)}
                        >
                          Remove Refund
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
