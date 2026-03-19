import { ClipboardList, Gem, Heart, Image, LayoutDashboard, MessageSquareText, Percent, Search, Tag, Users, Package, Star, Wallet, Gift } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/mockApi";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Products", href: "/admin/products", icon: Gem },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Referrals", href: "/admin/referrals", icon: Wallet },
  { label: "Community", href: "/admin/community", icon: Image },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquareText },
  { label: "Finance", href: "/admin/finance", icon: Percent },
  { label: "Coupons", href: "/admin/coupons", icon: Star },
  { label: "Rewards", href: "/admin/rewards", icon: Gift },
  { label: "Wishlist", href: "/admin/wishlist", icon: Heart },
] as const;

export default function AdminSidebar() {
  const location = useLocation();

  const onLogout = async () => {
    // Mock logout: existing app already uses `/login` route for normal flow.
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-black">H</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-black text-slate-100">Hasee Admin</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Pink & Slate</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                    <NavLink to={item.href} aria-label={item.label}>
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="ml-2">{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="outline"
          className="w-full rounded-xl bg-transparent border-slate-800 hover:bg-slate-900/50 font-bold"
          onClick={() => void onLogout()}
        >
          Logout
        </Button>
      </SidebarFooter>
    </div>
  );
}

