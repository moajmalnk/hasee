import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { getOrders, getRewardsData, type MockOrder, type RewardsData } from "@/services/mockApi";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type AdminOrder = MockOrder & {
  gpayStatus?: "Pending" | "Paid" | "Rejected";
};

type CategoryName = "Rayon" | "Dubai" | "Cotton";

const categoryByProductId: Record<number, CategoryName | undefined> = {
  1: "Rayon",
  2: "Dubai",
  3: "Cotton",
};

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString()}`;

export default function Finance() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [rewards, setRewards] = useState<RewardsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [o, r] = await Promise.all([getOrders(), getRewardsData()]);
        if (cancelled) return;
        setOrders(o as AdminOrder[]);
        setRewards(r);
      } catch {
        // Keep UI skeleton if mock fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paidOrders = useMemo(() => {
    return orders.filter((o) => (o.gpayStatus ?? (o.status === "Approved" ? "Paid" : "Pending")) === "Paid");
  }, [orders]);

  const pendingGpay = useMemo(() => {
    return orders.filter((o) => (o.gpayStatus ?? o.status) === "Pending").length;
  }, [orders]);

  const totalRevenue = useMemo(() => paidOrders.reduce((sum, o) => sum + o.amount, 0), [paidOrders]);
  const totalPaidOrders = paidOrders.length;
  const conversionRate = useMemo(() => {
    if (orders.length === 0) return 0;
    return (totalPaidOrders / orders.length) * 100;
  }, [orders.length, totalPaidOrders]);

  const salesVsTime = useMemo(() => {
    // Group last ~14 days for a readable line chart.
    if (paidOrders.length === 0) return [];
    const now = Date.now();
    const minTs = now - 14 * 24 * 60 * 60 * 1000;

    const points = new Map<string, number>();
    for (const o of paidOrders) {
      const ts = new Date(o.createdAt).getTime();
      if (ts < minTs) continue;
      const day = new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD
      points.set(day, (points.get(day) ?? 0) + o.amount);
    }

    const keys = Array.from(points.keys()).sort();
    return keys.map((k) => {
      const d = new Date(k);
      return { date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), sales: points.get(k) ?? 0 };
    });
  }, [paidOrders]);

  const salesByCategory = useMemo(() => {
    const totals: Record<CategoryName, number> = { Rayon: 0, Dubai: 0, Cotton: 0 };
    for (const o of paidOrders) {
      const c = categoryByProductId[o.productId];
      if (!c) continue;
      totals[c] += o.amount;
    }
    return (Object.keys(totals) as CategoryName[]).map((name) => ({ name, value: totals[name] }));
  }, [paidOrders]);

  const refundAnalytics = useMemo(() => {
    const delivered = (rewards?.leads ?? []).filter((l) => l.deliveryDate && l.productCategory) as Array<
      RewardsData["leads"][number] & { productCategory: CategoryName }
    >;

    const cats: CategoryName[] = ["Rayon", "Dubai", "Cotton"];
    const perCat = cats.map((cat) => {
      const inCat = delivered.filter((l) => l.productCategory === cat);
      const refunded = inCat.filter((l) => !!l.refunded).length;
      const total = inCat.length;
      const refundRate = total === 0 ? 0 : refunded / total;
      return { cat, total, refunded, refundRate };
    });

    const dubai = perCat.find((c) => c.cat === "Dubai")!;
    const dubaiHighRefund = dubai.refundRate >= 0.2;
    return { perCat, dubai, dubaiHighRefund };
  }, [rewards]);

  const profitTracker = useMemo(() => {
    const overhead = 2500; // Mock fixed expense.
    const refundExpense = (() => {
      const delivered = (rewards?.leads ?? []).filter((l) => l.deliveryDate && l.productCategory) as Array<
        RewardsData["leads"][number] & { productCategory: CategoryName }
      >;

      const avgOrderByCat: Record<CategoryName, number> = { Rayon: 0, Dubai: 0, Cotton: 0 };
      const countByCat: Record<CategoryName, number> = { Rayon: 0, Dubai: 0, Cotton: 0 };
      for (const o of paidOrders) {
        const c = categoryByProductId[o.productId];
        if (!c) continue;
        avgOrderByCat[c] += o.amount;
        countByCat[c] += 1;
      }
      for (const c of Object.keys(avgOrderByCat) as CategoryName[]) {
        avgOrderByCat[c] = countByCat[c] ? avgOrderByCat[c] / countByCat[c] : 0;
      }

      let total = 0;
      for (const cat of ["Rayon", "Dubai", "Cotton"] as CategoryName[]) {
        const refundedCount = delivered.filter((l) => l.productCategory === cat && !!l.refunded).length;
        total += refundedCount * avgOrderByCat[cat];
      }
      return total;
    })();

    const netProfit = totalRevenue - refundExpense - overhead;
    return { overhead, refundExpense, netProfit };
  }, [paidOrders, rewards, totalRevenue]);

  const kpis = [
    { label: "Total Revenue (INR)", value: formatINR(totalRevenue) },
    { label: "Total Orders", value: String(totalPaidOrders) },
    { label: "Pending GPay Verifications", value: String(pendingGpay) },
    { label: "Conversion Rate", value: `${conversionRate.toFixed(1)}%` },
  ];

  const pieColors: Record<CategoryName, string> = {
    Rayon: "#FFB6C1",
    Dubai: "#8B5CF6",
    Cotton: "#7DD3FC",
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground">Finance & Refunds</h1>
        <p className="text-sm text-muted-foreground">Track refunds and highlight risky categories (mock).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card
            key={k.label}
            className="rounded-2xl bg-card border border-border p-4"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{k.label}</p>
            <p className="text-xl font-black text-foreground mt-1">{k.value}</p>
            {k.label === "Total Revenue (INR)" && refundAnalytics.dubaiHighRefund ? (
              <p className="text-xs font-bold mt-2 text-destructive">Dubai refund risk detected</p>
            ) : null}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl bg-card border border-border p-4">
          <p className="text-sm font-black text-foreground">Sales vs. Time</p>
          <div className="h-72 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesVsTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#0b1220", border: "1px solid #243248", color: "#e2e8f0" }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#FB7185"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl bg-card border border-border p-4">
          <p className="text-sm font-black text-foreground flex items-center justify-between">
            <span>Sales by Category</span>
            <span
              className={
                refundAnalytics.dubaiHighRefund
                  ? "text-destructive text-xs font-bold"
                  : "text-muted-foreground text-xs font-bold"
              }
            >
              Dubai refund rate: {(refundAnalytics.dubai.refundRate * 100).toFixed(1)}%
            </span>
          </p>
          <div className="h-72 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{ background: "#0b1220", border: "1px solid #243248", color: "#e2e8f0" }}
                />
                <Pie
                  data={salesByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {salesByCategory.map((entry) => (
                    <Cell key={entry.name} fill={pieColors[entry.name as CategoryName]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            {(["Rayon", "Dubai", "Cotton"] as CategoryName[]).map((c) => (
              <span key={c} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[c] }} />
                {c}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl bg-card border border-border p-4">
        <p className="text-sm font-black text-foreground">Profit Tracker</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-3 text-muted-foreground">
            <span className="text-sm font-bold">Revenue</span>
            <span className="font-black text-foreground">{formatINR(totalRevenue)}</span>
          </div>
          <div
            className={
              refundAnalytics.dubaiHighRefund
                ? "flex items-center justify-between gap-3 text-destructive"
                : "flex items-center justify-between gap-3 text-muted-foreground"
            }
          >
            <span className="text-sm font-bold">Refunds (est.)</span>
            <span className="font-black text-foreground">{formatINR(profitTracker.refundExpense)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-muted-foreground">
            <span className="text-sm font-bold">Other Expenses</span>
            <span className="font-black text-foreground">{formatINR(profitTracker.overhead)}</span>
          </div>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-black text-foreground">Net Profit</span>
            <span className={`font-black ${profitTracker.netProfit >= 0 ? "text-whatsapp" : "text-destructive"}`}>
              {formatINR(profitTracker.netProfit)}
            </span>
          </div>
        </div>

        <div className="mt-4 border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-2 bg-secondary/50 text-xs font-bold text-muted-foreground">
            Refund rate by category (&lt;= 20% safe zone)
          </div>
          <div className="divide-y divide-border">
            {refundAnalytics.perCat.map((c) => {
              const risky = c.refundRate >= 0.2;
              return (
                <div
                  key={c.cat}
                  className={`px-4 py-2 flex items-center justify-between text-sm ${
                    risky ? "text-destructive bg-destructive/10" : "text-foreground"
                  }`}
                >
                  <span className="font-bold">{c.cat}</span>
                  <span className="font-black">
                    {c.total === 0 ? "—" : `${(c.refundRate * 100).toFixed(1)}%`}{" "}
                    {risky ? <span className="ml-2 text-destructive font-extrabold">RISK</span> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

