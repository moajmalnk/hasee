import AppLayout from '@/components/layout/AppLayout';
import { User, Package, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProfile, logout } from '@/services/mockApi';

const menuItems = [
  { icon: Package, label: "My Orders", href: "/my-orders" },
  { icon: Heart, label: "Wishlist", href: "/wishlist" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Logout", href: null },
];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<{ userName: string; email: string } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getProfile();
        setProfile(res);
      } catch {
        toast.error("Failed to load profile (mock)");
      }
    })();
  }, []);

  const onLogout = async () => {
    try {
      await logout();
      toast.success("Logged out (mock)");
      navigate('/');
    } catch {
      toast.error("Logout failed (mock)");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{profile?.userName ?? "Loading..."}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email ?? ""}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.label === "Logout") {
                  void onLogout();
                  return;
                }
                if (item.href) navigate(item.href);
              }}
              className={`w-full flex items-center justify-between gap-3 p-4 hover:bg-secondary transition-colors duration-200 ${
                item.href && location.pathname === item.href ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={`w-5 h-5 ${item.href && location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
              </div>
              {item.href ? <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> : null}
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
