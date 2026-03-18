import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, Heart, Pencil, Trash2, Star } from "lucide-react";
import type { Review } from "@/data/mockData";
import { products } from "@/data/products";
import {
  deleteReview,
  getProfile,
  getReviewLikeState,
  getReviewsByProductId,
  submitReview,
  toggleReviewLike,
  updateReview,
} from "@/services/mockApi";

const sizes = [1, 2, 3, 4, 5];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {sizes.map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= value ? "fill-warning text-warning" : "text-muted-foreground/20"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function Comments() {
  const { productId } = useParams();
  const product = useMemo(() => {
    const id = Number(productId);
    if (!id) return undefined;
    return products.find((p) => p.id === id);
  }, [productId]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ userName: string; email: string } | null>(null);
  const [reviewLikeStates, setReviewLikeStates] = useState<
    Record<number, { liked: boolean; likeCount: number }>
  >({});

  const [createOpen, setCreateOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const fetchReviews = async () => {
    if (!product) return;
    const data = await getReviewsByProductId(product.id);
    setReviews(data);

    const states = await Promise.all(
      data.map(async (r) => {
        const st = await getReviewLikeState(r.id);
        return [r.id, st] as const;
      }),
    );
    setReviewLikeStates(Object.fromEntries(states) as Record<number, { liked: boolean; likeCount: number }>);
  };

  useEffect(() => {
    void (async () => {
      try {
        await fetchReviews();
      } catch {
        toast.error("Failed to load comments (mock)");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getProfile();
        setProfile(res);
      } catch {
        setProfile(null);
      }
    })();
  }, []);

  const onCreate = async () => {
    if (!product) return;
    if (!profile?.userName) {
      return toast.error("You must be logged in to add comments (mock)");
    }
    if (rating === 0) return toast.error("Please select a rating");
    if (!comment.trim()) return toast.error("Please write a comment");

    try {
      await submitReview({
        productId: product.id,
        userName: profile.userName,
        rating,
        comment,
        verified: true,
      });
      toast.success("Comment added");
      setCreateOpen(false);
      setRating(0);
      setComment("");
      await fetchReviews();
    } catch {
      toast.error("Failed to add comment (mock)");
    }
  };

  const onStartEdit = (r: Review) => {
    if (!profile?.userName || profile.userName !== r.userName) return;
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  };

  const onSaveEdit = async () => {
    if (editingId == null) return;
    if (editRating === 0) return toast.error("Please select a rating");
    if (!editComment.trim()) return toast.error("Please write a comment");

    try {
      await updateReview({
        reviewId: editingId,
        rating: editRating,
        comment: editComment,
      });
      toast.success("Comment updated");
      setEditingId(null);
      setEditRating(0);
      setEditComment("");
      await fetchReviews();
    } catch {
      toast.error("Failed to update comment (mock)");
    }
  };

  const onDelete = async (reviewId: number) => {
    if (!profile?.userName) return;
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return;
    if (target.userName !== profile.userName) return;
    setDeleteTargetId(reviewId);
    setDeleteOpen(true);
  };

  const onConfirmDelete = async () => {
    if (deleteTargetId == null) return;
    try {
      await deleteReview(deleteTargetId);
      toast.success("Comment deleted");
      await fetchReviews();
    } catch {
      toast.error("Failed to delete comment (mock)");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const onToggleLike = async (reviewId: number) => {
    try {
      const next = await toggleReviewLike(reviewId);
      setReviewLikeStates((prev) => ({ ...prev, [reviewId]: next }));
    } catch {
      toast.error("Failed to like (mock)");
    }
  };

  if (!product) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-3">
          <h1 className="text-2xl font-black text-foreground">Comments</h1>
          <p className="text-sm text-muted-foreground">Product not found</p>
          <Button asChild>
            <Link to="/categories">Back</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
        <header className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-foreground truncate">Comments</h1>
              <p className="text-sm text-muted-foreground">{product.name}</p>
            </div>
            <Button variant="outline" className="rounded-xl text-xs font-bold" asChild>
              <Link to={`/product/${product.id}`}>Back to product</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-whatsapp" strokeWidth={1.5} />
              <p className="text-sm">All reviews are shown. Editing will re-submit for approval.</p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${reviews.length} comments`}
          </p>
          <Button className="rounded-xl h-11 font-bold" onClick={() => setCreateOpen(true)}>
            Add Comment
          </Button>
        </div>

        {loading ? (
          <div className="bg-card border border-border rounded-2xl p-4 text-muted-foreground text-sm">
            Loading comments...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground text-sm text-center space-y-2">
            <p className="font-bold text-foreground">No comments yet</p>
            <p>Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-black text-primary">{r.userName.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{r.userName}</p>
                      <p className="text-[10px] text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap ${
                        r.approved ? "bg-whatsapp/10 text-whatsapp" : "bg-warning/10 text-warning"
                      }`}
                    >
                      {r.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => void onToggleLike(r.id)}
                      aria-label="Like comment"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          reviewLikeStates[r.id]?.liked ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                        strokeWidth={1.5}
                      />
                    </Button>
                    <span className="text-[12px] font-bold text-muted-foreground min-w-6 text-center">
                      {reviewLikeStates[r.id]?.likeCount ?? 0}
                    </span>

                    {profile?.userName && profile.userName === r.userName && (
                      <div className="flex gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => onStartEdit(r)}
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => void onDelete(r.id)}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {editingId === r.id && profile?.userName === r.userName ? (
                  <div className="space-y-3">
                    <div className="flex gap-1 justify-start">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditRating(s)}
                          className="p-0.5 rounded-md"
                          aria-label={`Set rating ${s}`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              s <= editRating ? "fill-warning text-warning" : "text-muted-foreground/30"
                            }`}
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>

                    <Textarea
                      className="rounded-xl resize-none"
                      rows={3}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-xl font-bold" onClick={() => void onSaveEdit()}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl font-bold"
                        onClick={() => {
                          setEditingId(null);
                          setEditRating(0);
                          setEditComment("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-black">Add Comment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Rating</p>
                <div className="flex gap-1 justify-center">
                  {sizes.map((s) => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          s <= rating ? "fill-warning text-warning" : "text-muted-foreground/30"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Your experience</p>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="rounded-xl resize-none"
                  rows={4}
                />
              </div>

              <Button className="w-full rounded-xl h-11 font-bold" onClick={() => void onCreate()}>
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-black">Delete comment?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently remove your comment from this product.
            </p>

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-bold"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteTargetId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl font-bold"
                onClick={() => void onConfirmDelete()}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

