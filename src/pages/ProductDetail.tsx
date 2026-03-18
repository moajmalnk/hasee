import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, ChevronLeft, Star, Share2, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { products } from '@/data/products';
import { mockReviews, productLikes } from '@/data/mockData';
import { toast } from 'sonner';

const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(productLikes[Number(id)] || 0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const reviews = mockReviews.filter(r => r.productId === Number(id) && r.approved);

  // Mock multiple images
  const images = product ? [
    product.image,
    `https://placehold.co/400x600/FFB6C1/white?text=${product.category}+Back`,
    `https://placehold.co/400x600/FFC0CB/white?text=${product.category}+Detail`,
  ] : [];

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const shareToWhatsApp = () => {
    const text = `✨ Check out ${product.name} for just ₹${product.price}!\n🛍️ Shop on Hasee Maxi`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const submitReview = () => {
    if (reviewRating === 0) { toast.error('Please select a rating'); return; }
    toast.success('Review submitted! It will appear after approval.');
    setReviewOpen(false);
    setReviewRating(0);
    setReviewText('');
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center gap-3">
        <Link to="/" className="p-1.5 -ml-1.5 hover:bg-secondary rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </Link>
        <h1 className="text-sm font-bold text-foreground truncate flex-1">{product.name}</h1>
        <button onClick={shareToWhatsApp} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <Share2 className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
      </header>

      {/* Image Carousel */}
      <div className="relative">
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === selectedImage ? 'border-primary shadow-lg' : 'border-background/50'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Title, Price, Like */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{product.category}</p>
            <h2 className="text-xl font-black text-foreground mt-0.5">{product.name}</h2>
            <p className="text-2xl font-black text-foreground mt-1">₹{product.price}</p>
          </div>
          <button onClick={toggleLike} className="flex flex-col items-center gap-1">
            <motion.div
              whileTap={{ scale: 1.4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Heart
                className={`w-7 h-7 transition-colors duration-200 ${liked ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
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
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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
        <div className="bg-secondary rounded-2xl p-4">
          <p className="text-xs font-bold text-foreground mb-1">🧵 Fabric Guide</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {fabricInfo[product.category] || 'Premium quality fabric with excellent drape and comfort.'}
          </p>
        </div>

        {/* Share to WhatsApp */}
        <Button onClick={shareToWhatsApp} variant="whatsapp" className="w-full rounded-xl h-12 font-bold">
          <MessageCircle className="w-5 h-5 mr-2" strokeWidth={1.5} />
          Share on WhatsApp
        </Button>

        {/* Reviews Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Customer Reviews ({reviews.length})</h3>
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
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
                    <p className="text-xs font-bold text-foreground mb-2">Your Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setReviewRating(star)}>
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= reviewRating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                            }`}
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
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
                  <Button onClick={submitReview} className="w-full rounded-xl h-11 font-bold">
                    Submit Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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

      {/* Bottom spacer */}
      <div className="h-6" />
    </div>
  );
}
