import { Home, Grid3X3, Gift, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Grid3X3, label: 'Categories', href: '/categories' },
  { icon: Gift, label: 'Rewards', href: '/rewards' },
  { icon: Users, label: 'Community', href: '/community' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full bg-background/75 backdrop-blur-xl border-t border-border">
        <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className="relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-2xl transition-colors duration-200"
            >
              {/* Active background */}
              {isActive ? <span className="absolute inset-0 z-0 bg-primary/10 border border-primary/20 rounded-2xl" /> : null}

              <item.icon
                className={`w-5 h-5 transition-colors duration-200 z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={1.5}
              />
              <span
                className={`text-[10px] font-bold transition-colors duration-200 z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      </div>
    </nav>
  );
}
