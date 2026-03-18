import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Star, Camera, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/components/layout/AppLayout';
import { products } from '@/data/products';
import type { Review } from '@/data/mockData';
import { toast } from 'sonner';
import {
  addToCart,
  getApprovedReviewsByProductId,
  getCart,
  getProductLikeState,
  submitReview,
  toggleProductLike,
} from '@/services/mockApi';

const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const productId = Number(id);
  const product = products.find(p => p.id === productId);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartQtyForSelectedSize, setCartQtyForSelectedSize] = useState(0);

  const [reviews, setReviews] = useState<Review[]>([]);

  type FlowerParticle = {
    id: number;
    dx: number;
    dy: number;
    delay: number;
    dur: number;
    rot: number;
    scale: number;
    size: number;
  };
  const [flowerParticles, setFlowerParticles] = useState<FlowerParticle[]>([]);

  const triggerFiveStarBurst = () => {
    const count = 18;
    const base = Date.now();

    const parts: FlowerParticle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const radius = 40 + Math.random() * 70;
      return {
        id: base + i,
        dx: Math.cos(angle) * radius,
        dy: Math.sin(angle) * radius - 10 - Math.random() * 25,
        delay: Math.random() * 0.12,
        dur: 0.9 + Math.random() * 0.35,
        rot: Math.random() * 320 - 160,
        scale: 0.6 + Math.random() * 1.1,
        size: 10 + Math.random() * 12,
      };
    });

    // Store particles for a short window; animation is CSS-driven.
    setFlowerParticles(parts);
    window.setTimeout(() => setFlowerParticles([]), 1400);
  };

  useEffect(() => {
    if (!product) return;
    void (async () => {
      try {
        const likeState = await getProductLikeState(productId);
        setLiked(likeState.liked);
        setLikeCount(likeState.likeCount);

        const approved = await getApprovedReviewsByProductId(productId);
        setReviews(approved);
      } catch {
        toast.error("Failed to load product data (mock)");
      }
    })();
  }, [productId, product]);

  useEffect(() => {
    if (!product) return;
    void (async () => {
      try {
        const items = await getCart();
        const qty = items
          .filter((i) => i.productId === productId && i.size === selectedSize)
          .reduce((sum, i) => sum + i.qty, 0);
        setCartQtyForSelectedSize(qty);
      } catch {
        setCartQtyForSelectedSize(0);
      }
    })();
  }, [productId, selectedSize, product]);

  const images = product
    ? product.imageArray?.length
      ? product.imageArray
      : [product.image]
    : [];

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const toggleLike = async () => {
    try {
      const next = await toggleProductLike(productId);
      setLiked(next.liked);
      setLikeCount(next.likeCount);
    } catch {
      toast.error("Failed to like (mock)");
    }
  };

  const onAddToCart = async () => {
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      const items = await addToCart({ productId, qty: 1, size: selectedSize });
      const qty = items
        .filter((i) => i.productId === productId && i.size === selectedSize)
        .reduce((sum, i) => sum + i.qty, 0);
      setCartQtyForSelectedSize(qty);
      toast.success("Added to Cart");
    } catch {
      toast.error("Failed to add to cart (mock)");
    } finally {
      setAddingToCart(false);
    }
  };

  const shareToWhatsApp = () => {
    const text = `✨ Check out ${product.name} for just ₹${product.price}!\n🛍️ Shop on Hasee Maxi`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const onSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please write your review');
      return;
    }

    try {
      await submitReview({
        productId,
        userName: "Hasee User",
        rating: reviewRating,
        comment: reviewText,
        verified: true,
      });

      toast.success('Review submitted! It will appear after approval.');
      setReviewOpen(false);
      setReviewRating(0);
      setReviewText('');

      const approved = await getApprovedReviewsByProductId(productId);
      setReviews(approved);
    } catch {
      toast.error("Failed to submit review (mock)");
    }
  };

  const fabricInfo: Record<string, string> = {
    Rayon: '100% Premium Breathable Rayon — Lightweight, flowy drape. Machine washable at 30°C.',
    Dubai: 'Imported Dubai Silk Blend — Luxurious sheen with a soft hand-feel. Dry clean recommended.',
    Cotton: '100% Organic Cotton — Skin-friendly, breathable, and perfect for daily wear.',
    Alpine: 'Alpine Microfiber — Ultra-breathable, moisture-wicking. Great for hot climates.',
    Chiffon: 'Georgette Chiffon — Elegant semi-sheer fabric. Perfect for parties and events.',
    Linen: 'European Linen Blend — Natural texture, gets softer with every wash.',
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid md:grid-cols-2 md:gap-10 md:items-start">
          {/* Image Carousel */}
          <div className="relative mx-auto md:mx-0 md:max-w-[520px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                alt={product.name}
                className="w-full aspect-[3/4] object-cover bg-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 md:w-12 md:h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === selectedImage ? 'border-primary shadow-lg' : 'border-background/50'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
        {/* Title, Price, Like */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{product.category}</p>
            <h2 className="text-xl md:text-2xl font-black text-foreground mt-0.5">{product.name}</h2>
            <p className="text-2xl md:text-3xl font-black text-foreground mt-1">₹{product.price}</p>
          </div>
          <button onClick={toggleLike} className="flex flex-col items-center gap-1">
            <motion.div
              whileTap={{ scale: 1.4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Heart
                className={`w-7 h-7 md:w-8 md:h-8 transition-colors duration-200 ${
                  liked ? 'fill-primary text-primary' : 'text-muted-foreground'
                }`}
                strokeWidth={1.5}
              />
            </motion.div>
            <span className="text-[10px] font-bold text-muted-foreground">{likeCount}</span>
          </button>
        </div>

        {/* Size Selector */}
        <div>
          <p className="text-xs font-bold text-foreground mb-2">Select Size</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-xl text-sm md:text-[15px] font-bold transition-all ${
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Fabric Guide */}
        <div className="bg-secondary rounded-2xl p-4 md:p-5">
          <p className="text-xs font-bold text-foreground mb-1">🧵 Fabric Guide</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {fabricInfo[product.category] || 'Premium quality fabric with excellent drape and comfort.'}
          </p>
        </div>

        {/* Primary actions (tablet/desktop: side-by-side) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Add to Cart */}
          <Button
            onClick={onAddToCart}
            disabled={addingToCart}
            className="w-full rounded-xl h-12 font-bold"
          >
            {addingToCart ? `Adding — ${selectedSize}` : `Add to Cart — Size ${selectedSize}`}
          </Button>

          {/* Secondary action: cart if cart has items, otherwise WhatsApp share */}
          {cartQtyForSelectedSize > 0 ? (
            <Button
              onClick={() => navigate('/cart')}
              className="w-full rounded-xl h-12 font-bold"
            >
              <ShoppingCart className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Cart ({cartQtyForSelectedSize})
            </Button>
          ) : (
            <Button
              onClick={shareToWhatsApp}
              variant="whatsapp"
              className="w-full rounded-xl h-12 font-bold"
            >
              <MessageCircle className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Share on WhatsApp
            </Button>
          )}
        </div>

        {/* Reviews Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-foreground">Customer Reviews ({reviews.length})</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold text-center hidden sm:inline-flex"
                onClick={() => navigate(`/comments/${productId}`)}
              >
                Manage comments
              </Button>

              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold text-center">
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-black">Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    {/* Star Rating */}
                    <div>
                      <div className="relative">
                        <div className="flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              setReviewRating(star);
                              if (star === 5) triggerFiveStarBurst();
                            }}
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                star <= reviewRating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                              }`}
                              strokeWidth={1.5}
                            />
                          </button>
                        ))}
                        </div>
                        {flowerParticles.length > 0 && (
                          <div className="absolute inset-0 pointer-events-none">
                            {flowerParticles.map((p) => (
                              <span
                                key={p.id}
                                className="flowerParticle"
                                style={
                                  {
                                    width: p.size,
                                    height: p.size,
                                    ["--dx"]: `${p.dx}px`,
                                    ["--dy"]: `${p.dy}px`,
                                    ["--delay"]: `${p.delay}s`,
                                    ["--dur"]: `${p.dur}s`,
                                    ["--rot"]: `${p.rot}deg`,
                                    ["--s"]: `${p.scale}`,
                                  } as CSSProperties
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Tell us about your experience..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      className="rounded-xl resize-none"
                      rows={3}
                    />
                    <Button variant="outline" className="w-full rounded-xl">
                      <Camera className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Upload Photo
                    </Button>
                    <Button onClick={onSubmitReview} className="w-full rounded-xl h-11 font-bold">
                      Submit Review
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet. Be the first!</p>
          )}

          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-primary">{review.userName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{review.userName}</p>
                    {review.verified && (
                      <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">✓ Verified Buyer</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              {review.photo && (
                <img src={review.photo} alt="Review" className="w-20 h-20 rounded-lg object-cover" />
              )}
            </motion.div>
          ))}
        </section>

      </div>
    </div>
  </div>
    </AppLayout>
  );
}
