import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminShell from "./admin/AdminShell";
import Orders from "./admin/Orders";
import Finance from "./admin/Finance";
import AdminProducts from "./admin/Products";
import AdminCategories from "./admin/Categories";
import AdminCustomers from "./admin/Customers";
import AdminReferrals from "./admin/Referrals";
import AdminCommunity from "./admin/Community";
import AdminFeedback from "./admin/Feedback";
import AdminCoupons from "./admin/Coupons";
import AdminRewards from "./admin/Rewards";
import AdminWishlist from "./admin/Wishlist";

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 text-foreground">
      <p className="text-lg font-black text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">Coming soon (mock admin module).</p>
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  return (
    <AdminShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      </AnimatePresence>
    </AdminShell>
  );
}
