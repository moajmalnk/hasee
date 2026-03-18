import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { communityPosts } from '@/data/mockData';

export default function Community() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>(
    Object.fromEntries(communityPosts.map(p => [p.id, p.likes]))
  );

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setLikeCounts(prev => ({
      ...prev,
      [postId]: likedPosts.has(postId) ? prev[postId] - 1 : prev[postId] + 1,
    }));
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-black text-foreground">Community Styles</h1>
          <p className="text-sm text-muted-foreground">See how others wear their Hasee Maxis</p>
        </div>

        <div className="space-y-4">
          {communityPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
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
                        className={`w-6 h-6 transition-colors ${likedPosts.has(post.id) ? 'fill-primary text-primary' : 'text-foreground'}`}
                        strokeWidth={1.5}
                      />
                    </motion.div>
                    <span className="text-sm font-bold text-foreground">{likeCounts[post.id]}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-foreground">
                    <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
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
