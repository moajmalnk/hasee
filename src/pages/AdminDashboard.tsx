import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminShell from "@/pages/admin/AdminShell";
import Orders from "@/pages/admin/Orders";
import Finance from "@/pages/admin/Finance";
import AdminProducts from "@/pages/admin/Products";
import AdminCategories from "@/pages/admin/Categories";
import AdminCustomers from "@/pages/admin/Customers";
import AdminReferrals from "@/pages/admin/Referrals";
import AdminCommunity from "@/pages/admin/Community";
import AdminFeedback from "@/pages/admin/Feedback";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminRewards from "@/pages/admin/Rewards";
import AdminWishlist from "@/pages/admin/Wishlist";

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-slate-300">
      <p className="text-lg font-black text-slate-50">{title}</p>
      <p className="text-sm text-slate-400 mt-1">Coming soon (mock admin module).</p>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminShell>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Finance />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="community" element={<AdminCommunity />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="finance" element={<Finance />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="wishlist" element={<AdminWishlist />} />
          <Route path="*" element={<ComingSoon title="Page not found" />} />
        </Routes>
      </AnimatePresence>
    </AdminShell>
  );
}
