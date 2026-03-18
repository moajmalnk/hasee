import { useRef, useState } from "react";
import { Heart, MessageCircle, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Product } from '@/data/products';
import { addToCart, getProductLikeState, toggleProductLike } from "@/services/mockApi";
import { useEffect } from "react";

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const state = await getProductLikeState(product.id);
        setWishlisted(state.liked);
        setLikeCount(state.likeCount);
      } catch {
        setWishlisted(false);
        setLikeCount(0);
      }
    })();
  }, [product.id]);

  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `Check out this ${product.name} for ₹${product.price} on Hasee Maxi!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const onAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart({ productId: product.id, qty: 1, size: "L" });
      toast.success("Added to Cart");
    } catch {
      toast.error("Failed to add to cart (mock)");
    } finally {
      setAddingToCart(false);
    }
  };

  const onToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const next = await toggleProductLike(product.id);
      setWishlisted(next.liked);
      setLikeCount(next.likeCount);
      toast.success(next.liked ? "Added to Wishlist" : "Removed from Wishlist");
    } catch {
      toast.error("Failed to update wishlist (mock)");
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        onMouseEnter={() => {
          if (product.videoUrl && videoRef.current) {
            setHovered(true);
            void videoRef.current.play().catch(() => {});
          }
        }}
        onMouseLeave={() => {
          if (product.videoUrl && videoRef.current) {
            setHovered(false);
            videoRef.current.pause();
            // Reset to first frame so next hover starts from the beginning.
            try {
              videoRef.current.currentTime = 0;
            } catch {
              // ignore
            }
          }
        }}
      >
        <div className="aspect-[2/3] overflow-hidden bg-secondary relative">
          <img
            src={product.imageArray[0] ?? product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${product.videoUrl ? "group-hover:scale-105" : "group-hover:scale-105"}`}
            loading="lazy"
          />

          {product.videoUrl && (
            <video
              ref={videoRef}
              src={product.videoUrl}
              muted
              playsInline
              loop
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
              preload="metadata"
            />
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{product.category}</p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAddToCart}
                disabled={addingToCart}
                className="inline-flex p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add to cart"
              >
                {addingToCart ? (
                  <span className="text-base leading-none">…</span>
                ) : (
                  <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>

                <button
                  onClick={onToggleWishlist}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors duration-200 active:scale-95"
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${wishlisted ? "fill-primary text-primary" : "text-foreground/80"}`}
                    strokeWidth={1.5}
                  />
                </button>

              <button
                onClick={shareToWhatsApp}
                className="p-2 bg-whatsapp/10 text-whatsapp rounded-full hover:bg-whatsapp/20 transition-colors duration-200 active:scale-95"
                aria-label="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
