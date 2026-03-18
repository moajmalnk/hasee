import { MessageCircle } from 'lucide-react';

export default function StickyHeader() {
  const openWhatsApp = () => {
    window.open('https://wa.me/919947428821?text=Hi! I need help with Hasee Maxi.', '_blank');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-black">H</span>
          </div>
          <span className="text-lg font-bold text-foreground">Hasee Maxi</span>
        </div>
        <button
          onClick={openWhatsApp}
          className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-200"
        >
          <MessageCircle className="w-5 h-5 text-whatsapp-foreground" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
