import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Categories from "./pages/Categories.tsx";
import Rewards from "./pages/Rewards.tsx";
import Cart from "./pages/Cart.tsx";
import Profile from "./pages/Profile.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Community from "./pages/Community.tsx";
import MyOrders from "./pages/MyOrders.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import ClaimReward from "./pages/ClaimReward.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
import TermsOfUse from "./pages/TermsOfUse.tsx";
import Comments from "./pages/Comments.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/community" element={<Community />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/claim-reward" element={<ClaimReward />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/comments/:productId" element={<Comments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
