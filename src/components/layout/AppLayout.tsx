import { ReactNode } from 'react';
import StickyHeader from './StickyHeader';
import MobileNav from './MobileNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <main className="pb-24">{children}</main>
      <MobileNav />
    </div>
  );
}
