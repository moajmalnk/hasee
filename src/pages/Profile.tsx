import AppLayout from '@/components/layout/AppLayout';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';

const menuItems = [
  { icon: Package, label: 'My Orders' },
  { icon: Heart, label: 'Wishlist' },
  { icon: Settings, label: 'Settings' },
  { icon: LogOut, label: 'Logout' },
];

export default function Profile() {
  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Hasee User</h1>
            <p className="text-sm text-muted-foreground">hasee@example.com</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 p-4 hover:bg-secondary transition-colors duration-200">
              <item.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
