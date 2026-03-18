import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import type { CommunityPostView } from '@/services/mockApi';
import { getCommunityPosts, toggleCommunityLike } from '@/services/mockApi';
import { useNavigate } from 'react-router-dom';
import { products } from '@/data/products';
import { getReviewsByProductId } from '@/services/mockApi';

export default function Community() {
  const [posts, setPosts] = useState<CommunityPostView[]>([]);
  const [commentCountsByProductId, setCommentCountsByProductId] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const data = await getCommunityPosts();
      setPosts(data);
    })();
  }, []);

  const postToProductId = useMemo(() => {
    // Best-effort mapping from CommunityPost productName to catalog product.
    // Community productName strings sometimes include the category (e.g. "Premium Rayon Maxi").
    return (post: CommunityPostView): number | null => {
      const target = post.productName.toLowerCase();
      const match = products.find((p) => target.includes(p.category.toLowerCase()));
      return match?.id ?? null;
    };
  }, []);

  useEffect(() => {
    // Fetch comment counts per product so the UI shows "comments" next to the speech icon.
    void (async () => {
      const uniqueProductIds = new Set<number>();
      for (const p of posts) {
        const pid = postToProductId(p);
        if (pid) uniqueProductIds.add(pid);
      }

      const next: Record<number, number> = {};
      await Promise.all(
        [...uniqueProductIds].map(async (pid) => {
          try {
            const reviews = await getReviewsByProductId(pid);
            next[pid] = reviews.length;
          } catch {
            next[pid] = 0;
          }
        }),
      );

      setCommentCountsByProductId(next);
    })();
  }, [posts, postToProductId]);

  const toggleLike = async (postId: number) => {
    const updated = await toggleCommunityLike(postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-xl font-black text-foreground">Community Styles</h1>
          <p className="text-sm text-muted-foreground">See how others wear their Hasee Maxis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="h-full bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* User header */}
              <div className="flex items-center gap-3 p-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-black text-primary">{post.userAvatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{post.userName}</p>
                  <p className="text-[10px] text-muted-foreground">{post.date} • {post.productName}</p>
                </div>
              </div>

              {/* Image */}
              <img src={post.image} alt={post.caption} className="w-full aspect-[3/4] object-cover bg-secondary" loading="lazy" />

              {/* Actions */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5">
                    <motion.div whileTap={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                      <Heart
                        className={`w-6 h-6 transition-colors ${post.liked ? 'fill-primary text-primary' : 'text-foreground'}`}
                        strokeWidth={1.5}
                      />
                    </motion.div>
                    <span className="text-sm font-bold text-foreground">{post.likes}</span>
                  </button>
                    <button
                      className="flex items-center gap-1.5 text-foreground"
                      onClick={() => {
                        const pid = postToProductId(post);
                        if (!pid) return;
                        navigate(`/comments/${pid}`);
                      }}
                      aria-label="Open comments"
                    >
                    <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                      {(() => {
                        const pid = postToProductId(post);
                        if (!pid) return null;
                        const count = commentCountsByProductId[pid] ?? 0;
                        return <span className="text-sm font-bold text-foreground">{count}</span>;
                      })()}
                  </button>
                </div>
                <p className="text-sm text-foreground"><span className="font-bold">{post.userName}</span> {post.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
