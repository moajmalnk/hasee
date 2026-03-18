import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Product } from '@/data/products';

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `Check out this ${product.name} for ₹${product.price} on Hasee Maxi!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="aspect-[2/3] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{product.category}</p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            <button
              onClick={shareToWhatsApp}
              className="p-2 bg-whatsapp/10 text-whatsapp rounded-full hover:bg-whatsapp/20 transition-colors duration-200 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
