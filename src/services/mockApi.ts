import { communityPosts, mockReviews, productLikes, type CommunityPost, type Review } from "@/data/mockData";
import { products, type Product } from "@/data/products";
import type { OnboardingData, Role, Session } from "@/auth/types";

type OrderStatus = "Pending" | "Approved" | "Rejected";

type GpayStatus = "Pending" | "Paid" | "Rejected";

export type MockOrder = {
  id: string;
  productId: number;
  productName: string;
  amount: number;
  customer: string;
  status: OrderStatus;
  // Admin-only payment verification state.
  gpayScreenshotUrl?: string;
  gpayStatus?: GpayStatus;
  // Referral lead phone (referee) that should unlock the 15-day reward window.
  refereePhone?: string;
  createdAt: string; // ISO
  expectedDeliveryAt: string; // ISO
  trackingCode: string;
  approvedAt?: string; // ISO
  rejectedAt?: string; // ISO
};

export type MockCartItem = {
  productId: number;
  qty: number;
  size: string;
};

export type CommunityPostView = CommunityPost & { liked: boolean };

type RewardsLeadBase = {
  phone: string;
  name: string;
  deliveryDate?: string; // ISO string; absent means only Clicked
  refunded?: boolean;
  // Used by admin referrals: who invited this lead (referrer) and which product category they bought.
  referrerPhone?: string;
  referrerName?: string;
  productCategory?: string; // Rayon | Dubai | Cotton | ...
};

export type RewardsLead = RewardsLeadBase & {
  status: "Paid" | "Pending" | "Clicked" | "Refunded";
};
export type RewardsData = {
  referralCount: number;
  target: number;
  referralLink: string;
  leads: RewardsLead[];
};

export type SettingsData = {
  notificationsEnabled: boolean;
  marketingEnabled: boolean;
  language: "English" | "Hindi";
  darkMode: boolean;
};

export type DeliveryAddress = {
  id: string;
  label: string; // e.g., Home, Work
  recipientName: string;
  mobile: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
  isDefault?: boolean;
};

const MOCK_LATENCY_MS = 240;
// Cart UI needs to feel snappy; keep cart operations faster than other mock endpoints.
const MOCK_CART_LATENCY_MS = 50;
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// In-memory "database" for mock behavior.
let reviewsState: Review[] = mockReviews.map((r) => ({ ...r }));
let communityPostsState: CommunityPost[] = communityPosts.map((p) => ({ ...p }));
const productLikesState: Record<number, number> = { ...productLikes };
const likedCommunityPostIds = new Set<number>();
const likedProductIds = new Set<number>();
let ordersState: MockOrder[] = [
  {
    id: "#8821",
    productId: 2,
    productName: "Dubai Silk Maxi",
    amount: 2100,
    customer: "Aisha K.",
    status: "Pending",
    gpayStatus: "Pending",
    gpayScreenshotUrl: "https://placehold.co/320x200/8A2BE2/ffffff?text=GPay+Screenshot",
    refereePhone: "1000000201",
    createdAt: new Date(Date.now() - MS_PER_DAY * 1).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 4).toISOString(),
    trackingCode: "TRK-8821",
  },
  {
    id: "#8822",
    productId: 2,
    productName: "Dubai Silk Maxi",
    amount: 2100,
    customer: "Priya M.",
    status: "Pending",
    gpayStatus: "Pending",
    gpayScreenshotUrl: "https://placehold.co/320x200/9932CC/ffffff?text=GPay+Screenshot",
    refereePhone: "1000000202",
    createdAt: new Date(Date.now() - MS_PER_DAY * 2).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 3).toISOString(),
    trackingCode: "TRK-8822",
  },
  {
    id: "#8823",
    productId: 1,
    productName: "Rayon Maxi",
    amount: 1650,
    customer: "Fatima R.",
    status: "Pending",
    gpayStatus: "Pending",
    gpayScreenshotUrl: "https://placehold.co/320x200/FFB6C1/ffffff?text=GPay+Screenshot",
    refereePhone: "2000000201",
    createdAt: new Date(Date.now() - MS_PER_DAY * 0.5).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 5).toISOString(),
    trackingCode: "TRK-8823",
  },
  {
    id: "#8824",
    productId: 1,
    productName: "Rayon Maxi",
    amount: 1650,
    customer: "Noor S.",
    status: "Pending",
    gpayStatus: "Pending",
    gpayScreenshotUrl: "https://placehold.co/320x200/FF69B4/ffffff?text=GPay+Screenshot",
    refereePhone: "2000000202",
    createdAt: new Date(Date.now() - MS_PER_DAY * 1.2).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 4.3).toISOString(),
    trackingCode: "TRK-8824",
  },
  {
    id: "#8825",
    productId: 3,
    productName: "Cotton Maxi",
    amount: 2700,
    customer: "Zainab A.",
    status: "Pending",
    gpayStatus: "Pending",
    gpayScreenshotUrl: "https://placehold.co/320x200/2E8B57/ffffff?text=GPay+Screenshot",
    refereePhone: "3000000201",
    createdAt: new Date(Date.now() - MS_PER_DAY * 0.7).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 5.2).toISOString(),
    trackingCode: "TRK-8825",
  },
  // Paid (already verified) orders for analytics / charts.
  ...Array.from({ length: 12 }).map((_, i) => {
    const idx = i + 1;
    return {
      id: `#9100${idx}`,
      productId: 2,
      productName: "Dubai Silk Maxi",
      amount: 2100,
      customer: ["Aisha K.", "Priya M.", "Fatima R.", "Noor S.", "Sara J.", "Zainab A.", "Meena T."][i % 7]!,
      status: "Approved",
      gpayStatus: "Paid",
      gpayScreenshotUrl: "https://placehold.co/320x200/8A2BE2/ffffff?text=Paid",
      refereePhone: `10000000${idx}`,
      createdAt: new Date(Date.now() - MS_PER_DAY * (20 + i)).toISOString(),
      expectedDeliveryAt: new Date(Date.now() - MS_PER_DAY * 2).toISOString(),
      trackingCode: `TRK-9100${idx}`,
    } satisfies MockOrder;
  }),
  ...Array.from({ length: 6 }).map((_, i) => {
    const idx = i + 1;
    return {
      id: `#9200${idx}`,
      productId: 1,
      productName: "Rayon Maxi",
      amount: 1650,
      customer: ["Amina S.", "Rashmi V.", "Hina P.", "Nida K.", "Asha J.", "Megha R."][i % 6]!,
      status: "Approved",
      gpayStatus: "Paid",
      gpayScreenshotUrl: "https://placehold.co/320x200/FFB6C1/ffffff?text=Paid",
      refereePhone: `200000000${idx}`,
      createdAt: new Date(Date.now() - MS_PER_DAY * (18 + i)).toISOString(),
      expectedDeliveryAt: new Date(Date.now() - MS_PER_DAY * 3).toISOString(),
      trackingCode: `TRK-9200${idx}`,
    } satisfies MockOrder;
  }),
  ...Array.from({ length: 4 }).map((_, i) => {
    const idx = i + 1;
    return {
      id: `#9300${idx}`,
      productId: 3,
      productName: "Cotton Maxi",
      amount: idx === 4 ? 2600 : 2700,
      customer: ["Aamna N.", "Rashmi V.", "Noor S.", "Fatima R."][i % 4]!,
      status: "Approved",
      gpayStatus: "Paid",
      gpayScreenshotUrl: "https://placehold.co/320x200/2E8B57/ffffff?text=Paid",
      refereePhone: `300000000${idx}`,
      createdAt: new Date(Date.now() - MS_PER_DAY * (25 + i)).toISOString(),
      expectedDeliveryAt: new Date(Date.now() - MS_PER_DAY * 4).toISOString(),
      trackingCode: `TRK-9300${idx}`,
    } satisfies MockOrder;
  }),
];
let cartState: MockCartItem[] = [{ productId: 1, qty: 1, size: "L" }];

let reviewIdSeq = Math.max(...mockReviews.map((r) => r.id), 0) + 1;
let orderSeq = Math.max(...ordersState.map((o) => Number(String(o.id).replace("#", ""))), 0) + 1;

// In-memory "likes" for reviews/comments.
const reviewLikesState: Record<number, number> = Object.fromEntries(
  mockReviews.map((r) => [r.id, 2 + r.id * 3]),
) as Record<number, number>;
const likedReviewIds = new Set<number>();

let sessionState = {
  loggedIn: true,
  role: "CUSTOMER" as Role,
  userName: "Hasee User",
  email: "hasee@example.com",
  onboardingComplete: false,
  onboarding: undefined as OnboardingData | undefined,
  whatsappNumber: "9947428821",
  phoneNumber: undefined as string | undefined,
  location: "Kochi (City)",
  favoriteColors: ["Red", "Blue"],
  profilePhotoUrl: undefined as string | undefined,
};

let addressesState: DeliveryAddress[] = [
  {
    id: "addr-1",
    label: "Home",
    recipientName: "Hasee User",
    mobile: "9947428821",
    line1: "Hasee Maxi, 1st Main Road",
    line2: "Near City Center",
    city: "Kochi",
    state: "Kerala",
    pin: "682001",
    isDefault: true,
  },
];

let settingsState: SettingsData = {
  notificationsEnabled: true,
  marketingEnabled: false,
  language: "English",
  darkMode: false,
};

type RewardsState = {
  target: number;
  referralLink: string;
  leads: RewardsLeadBase[];
};

// The "15-day rule" is applied dynamically in `getRewardsData()` using `deliveryDate` + `refunded`.
const rewardsState: RewardsState = {
  target: 10,
  referralLink: "https://hasee.in/ref/USR001",
  leads: [
    // Pending gpay unlocks (delivery window < 15 days)
    {
      phone: "1000000201",
      name: "Dubai Pending 1",
      deliveryDate: new Date(Date.now() - MS_PER_DAY * 8).toISOString(),
      referrerPhone: "6000000001",
      referrerName: "Rahul K.",
      productCategory: "Dubai",
    },
    {
      phone: "1000000202",
      name: "Dubai Pending 2",
      deliveryDate: new Date(Date.now() - MS_PER_DAY * 8.2).toISOString(),
      referrerPhone: "6000000002",
      referrerName: "Meera S.",
      productCategory: "Dubai",
    },
    {
      phone: "2000000201",
      name: "Rayon Pending 1",
      deliveryDate: new Date(Date.now() - MS_PER_DAY * 7.6).toISOString(),
      referrerPhone: "6000000003",
      referrerName: "Sana M.",
      productCategory: "Rayon",
    },
    {
      phone: "2000000202",
      name: "Rayon Pending 2",
      deliveryDate: new Date(Date.now() - MS_PER_DAY * 6.8).toISOString(),
      referrerPhone: "6000000001",
      referrerName: "Rahul K.",
      productCategory: "Rayon",
    },
    {
      phone: "3000000201",
      name: "Cotton Pending 1",
      deliveryDate: new Date(Date.now() - MS_PER_DAY * 5.1).toISOString(),
      referrerPhone: "6000000002",
      referrerName: "Meera S.",
      productCategory: "Cotton",
    },

    // Paid + refunded leads (delivery window >= 15 days)
    ...Array.from({ length: 12 }).map((_, i) => {
      const idx = i + 1;
      return {
        phone: `10000000${idx}`,
        name: `Dubai Paid ${idx}`,
        deliveryDate: new Date(Date.now() - MS_PER_DAY * (20 + i * 0.15)).toISOString(),
        refunded: idx <= 3, // ~25% Dubai refund rate (meets >= 20% highlight)
        referrerPhone: idx % 3 === 0 ? "6000000003" : idx % 3 === 1 ? "6000000001" : "6000000002",
        referrerName: idx % 3 === 0 ? "Sana M." : idx % 3 === 1 ? "Rahul K." : "Meera S.",
        productCategory: "Dubai",
      } satisfies RewardsLeadBase;
    }),
    ...Array.from({ length: 6 }).map((_, i) => {
      const idx = i + 1;
      return {
        phone: `200000000${idx}`,
        name: `Rayon Paid ${idx}`,
        deliveryDate: new Date(Date.now() - MS_PER_DAY * (19 + i * 0.2)).toISOString(),
        refunded: idx === 2 ? true : false,
        referrerPhone: idx % 3 === 0 ? "6000000002" : idx % 3 === 1 ? "6000000001" : "6000000003",
        referrerName: idx % 3 === 0 ? "Meera S." : idx % 3 === 1 ? "Rahul K." : "Sana M.",
        productCategory: "Rayon",
      } satisfies RewardsLeadBase;
    }),
    ...Array.from({ length: 4 }).map((_, i) => {
      const idx = i + 1;
      return {
        phone: `300000000${idx}`,
        name: `Cotton Paid ${idx}`,
        deliveryDate: new Date(Date.now() - MS_PER_DAY * (21 + i * 0.12)).toISOString(),
        refunded: false,
        referrerPhone: idx % 3 === 0 ? "6000000001" : idx % 3 === 1 ? "6000000002" : "6000000003",
        referrerName: idx % 3 === 0 ? "Rahul K." : idx % 3 === 1 ? "Meera S." : "Sana M.",
        productCategory: "Cotton",
      } satisfies RewardsLeadBase;
    }),
  ],
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export async function getProducts(): Promise<Product[]> {
  await sleep(MOCK_LATENCY_MS);
  return clone(products);
}

export async function getProductLikeState(productId: number): Promise<{ liked: boolean; likeCount: number }> {
  await sleep(MOCK_LATENCY_MS);
  return {
    liked: likedProductIds.has(productId),
    likeCount: productLikesState[productId] ?? 0,
  };
}

export async function toggleProductLike(productId: number): Promise<{ liked: boolean; likeCount: number }> {
  await sleep(MOCK_LATENCY_MS);

  const wasLiked = likedProductIds.has(productId);
  if (wasLiked) {
    likedProductIds.delete(productId);
    productLikesState[productId] = Math.max(0, (productLikesState[productId] ?? 0) - 1);
  } else {
    likedProductIds.add(productId);
    productLikesState[productId] = (productLikesState[productId] ?? 0) + 1;
  }

  return {
    liked: likedProductIds.has(productId),
    likeCount: productLikesState[productId] ?? 0,
  };
}

export async function resetProductLikes(productId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  productLikesState[productId] = 0;
  likedProductIds.delete(productId);
}

export async function getProductLikeCounts(): Promise<Record<number, number>> {
  await sleep(MOCK_LATENCY_MS);
  return clone(productLikesState);
}

export async function getApprovedReviewsByProductId(productId: number): Promise<Review[]> {
  await sleep(MOCK_LATENCY_MS);
  return clone(reviewsState.filter((r) => r.productId === productId && r.approved));
}

export async function getAllReviews(): Promise<Review[]> {
  await sleep(MOCK_LATENCY_MS);
  return clone(reviewsState);
}

export async function getReviewLikeState(reviewId: number): Promise<{ liked: boolean; likeCount: number }> {
  await sleep(MOCK_LATENCY_MS);
  return {
    liked: likedReviewIds.has(reviewId),
    likeCount: reviewLikesState[reviewId] ?? 0,
  };
}

export async function toggleReviewLike(reviewId: number): Promise<{ liked: boolean; likeCount: number }> {
  await sleep(MOCK_LATENCY_MS);

  const wasLiked = likedReviewIds.has(reviewId);
  if (wasLiked) likedReviewIds.delete(reviewId);
  else likedReviewIds.add(reviewId);

  const current = reviewLikesState[reviewId] ?? 0;
  reviewLikesState[reviewId] = Math.max(0, current + (wasLiked ? -1 : 1));

  return {
    liked: likedReviewIds.has(reviewId),
    likeCount: reviewLikesState[reviewId] ?? 0,
  };
}

export async function submitReview(input: {
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  photo?: string;
  verified?: boolean;
}): Promise<Review> {
  await sleep(MOCK_LATENCY_MS);

  const newReview: Review = {
    id: reviewIdSeq++,
    productId: input.productId,
    userName: input.userName,
    rating: input.rating,
    comment: input.comment,
    photo: input.photo,
    verified: input.verified ?? true,
    date: "just now",
    approved: false,
  };

  reviewsState = [newReview, ...reviewsState];
  // Initialize like count for newly created reviews.
  if (reviewLikesState[newReview.id] == null) reviewLikesState[newReview.id] = 0;
  return clone(newReview);
}

export async function approveReview(reviewId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  reviewsState = reviewsState.map((r) => (r.id === reviewId ? { ...r, approved: true } : r));
}

export async function deleteReview(reviewId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  reviewsState = reviewsState.filter((r) => r.id !== reviewId);
  likedReviewIds.delete(reviewId);
  delete reviewLikesState[reviewId];
}

export async function updateReview(input: {
  reviewId: number;
  rating: number;
  comment: string;
}): Promise<Review> {
  await sleep(MOCK_LATENCY_MS);

  const { reviewId, rating, comment } = input;
  const existing = reviewsState.find((r) => r.id === reviewId);
  if (!existing) throw new Error("Review not found (mock)");

  // After editing, mark as not approved again so admin can review updated content.
  reviewsState = reviewsState.map((r) =>
    r.id !== reviewId
      ? r
      : {
          ...r,
          rating,
          comment,
          approved: false,
          date: "just now",
        },
  );

  const updated = reviewsState.find((r) => r.id === reviewId);
  if (!updated) throw new Error("Review not found (mock)");
  return clone(updated);
}

export async function getReviewsByProductId(productId: number): Promise<Review[]> {
  await sleep(MOCK_LATENCY_MS);
  return clone(reviewsState.filter((r) => r.productId === productId));
}

export async function getCommunityPosts(): Promise<CommunityPostView[]> {
  await sleep(MOCK_LATENCY_MS);
  // Public homepage: only show approved style photos.
  return communityPostsState
    .filter((p) => p.approved !== false)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .map((p) => ({ ...p, liked: likedCommunityPostIds.has(p.id) }));
}

// Admin view: show all customer posts, including pending/unapproved.
export async function getCommunityModerationPosts(): Promise<CommunityPostView[]> {
  await sleep(MOCK_LATENCY_MS);
  return communityPostsState.map((p) => ({ ...p, liked: likedCommunityPostIds.has(p.id) }));
}

export async function approveCommunityPost(postId: number, featured = false): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  communityPostsState = communityPostsState.map((p) =>
    p.id === postId
      ? {
          ...p,
          approved: true,
          featured,
        }
      : p,
  );
}

export async function deleteCommunityPost(postId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  communityPostsState = communityPostsState.filter((p) => p.id !== postId);
  likedCommunityPostIds.delete(postId);
}

export async function setCommunityFeatured(postId: number, featured: boolean): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  communityPostsState = communityPostsState.map((p) => (p.id === postId ? { ...p, featured } : p));
}

export async function toggleCommunityLike(postId: number): Promise<CommunityPostView> {
  await sleep(MOCK_LATENCY_MS);

  const wasLiked = likedCommunityPostIds.has(postId);
  if (wasLiked) likedCommunityPostIds.delete(postId);
  else likedCommunityPostIds.add(postId);

  communityPostsState = communityPostsState.map((p) => {
    if (p.id !== postId) return p;
    const nextLikes = Math.max(0, p.likes + (wasLiked ? -1 : 1));
    return { ...p, likes: nextLikes };
  });

  const updated = communityPostsState.find((p) => p.id === postId);
  if (!updated) throw new Error("Community post not found");
  return { ...updated, liked: likedCommunityPostIds.has(postId) };
}

export async function getOrders(): Promise<MockOrder[]> {
  await sleep(MOCK_LATENCY_MS);
  return clone(ordersState);
}

export async function approveOrder(orderId: string): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  const now = new Date();
  ordersState = ordersState.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status: "Approved",
          approvedAt: now.toISOString(),
          gpayStatus: "Paid",
          // After approval, estimate delivery for 2 more days.
          expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 2).toISOString(),
        }
      : o,
  );

  // Trigger referral eligibility update for the referee (mock delivery).
  const updated = ordersState.find((o) => o.id === orderId);
  if (updated?.refereePhone) {
    const deliveryDate = new Date(Date.now() - MS_PER_DAY * 20).toISOString(); // days > 15
    rewardsState.leads = rewardsState.leads.map((lead) =>
      lead.phone === updated.refereePhone
        ? {
            ...lead,
            refunded: false,
            deliveryDate,
          }
        : lead,
    );
  }
}

export async function rejectOrder(orderId: string): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  const now = new Date();
  ordersState = ordersState.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status: "Rejected",
          rejectedAt: now.toISOString(),
          gpayStatus: "Rejected",
        }
      : o,
  );

  // Keep the referee in "not eligible" state (mock pending window).
  const updated = ordersState.find((o) => o.id === orderId);
  if (updated?.refereePhone) {
    const deliveryDate = new Date(Date.now() - MS_PER_DAY * 8).toISOString(); // <= 15 => Pending
    rewardsState.leads = rewardsState.leads.map((lead) =>
      lead.phone === updated.refereePhone
        ? {
            ...lead,
            refunded: false,
            deliveryDate,
          }
        : lead,
    );
  }
}

export async function getCart(): Promise<MockCartItem[]> {
  await sleep(MOCK_CART_LATENCY_MS);
  return clone(cartState);
}

export async function addToCart(input: { productId: number; qty: number; size: string }): Promise<MockCartItem[]> {
  await sleep(MOCK_CART_LATENCY_MS);
  const { productId, qty, size } = input;
  if (!productId || qty <= 0 || !size) throw new Error("Invalid cart input");

  const existingIndex = cartState.findIndex((ci) => ci.productId === productId && ci.size === size);
  if (existingIndex >= 0) {
    cartState[existingIndex] = { ...cartState[existingIndex], qty: cartState[existingIndex].qty + qty };
  } else {
    cartState = [{ productId, qty, size }, ...cartState];
  }

  return clone(cartState);
}

export async function adjustCartItem(input: { productId: number; size: string; delta: number }): Promise<MockCartItem[]> {
  await sleep(MOCK_CART_LATENCY_MS);
  const { productId, size, delta } = input;

  if (!productId || !size) throw new Error("Invalid cart input");
  if (!Number.isFinite(delta) || delta === 0) return clone(cartState);

  const existingIndex = cartState.findIndex((ci) => ci.productId === productId && ci.size === size);
  if (existingIndex < 0) {
    // Negative delta on a non-existent item is a no-op.
    if (delta < 0) return clone(cartState);
    cartState = [{ productId, qty: delta, size }, ...cartState];
    return clone(cartState);
  }

  const nextQty = cartState[existingIndex].qty + delta;
  if (nextQty <= 0) {
    cartState = cartState.filter((_, i) => i !== existingIndex);
  } else {
    cartState[existingIndex] = { ...cartState[existingIndex], qty: nextQty };
  }

  return clone(cartState);
}

function getProductById(productId: number): Product | undefined {
  return products.find((p) => p.id === productId);
}

export async function applyCouponCode(input: { code: string; subtotal: number }): Promise<{ ok: true; discount: number; label: string } | { ok: false; message: string }> {
  await sleep(MOCK_LATENCY_MS);

  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a coupon code" };

  if (code === "SAVE10") {
    const discount = Math.round(input.subtotal * 0.1);
    return { ok: true, discount, label: "SAVE10 (10% OFF)" };
  }

  if (code === "WELCOME50") {
    const discount = Math.min(50, Math.max(0, input.subtotal - 1));
    return { ok: true, discount, label: "WELCOME50 (UP TO ₹50 OFF)" };
  }

  return { ok: false, message: "Invalid coupon code (mock)" };
}

export async function placeOrder(input: { couponCode?: string }): Promise<MockOrder> {
  await sleep(MOCK_LATENCY_MS);

  if (cartState.length === 0) throw new Error("Cart is empty");

  const user = sessionState.userName;
  const lineItems = cartState.map((ci) => {
    const p = getProductById(ci.productId);
    return { ci, price: p?.price ?? 0, name: p?.name ?? `Product ${ci.productId}` };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.price * li.ci.qty, 0);

  let discount = 0;
  if (input.couponCode) {
    const coupon = await applyCouponCode({ code: input.couponCode, subtotal });
    if (coupon.ok) discount = coupon.discount;
  }

  const total = Math.max(0, subtotal - discount);

  // For simplicity, one order line is shown in Admin UI; we still support multiple cart items internally.
  const primary = lineItems[0];

  const newOrder: MockOrder = {
    id: `#${orderSeq++}`,
    productId: primary.ci.productId,
    productName: primary.name,
    amount: total,
    customer: user,
    status: "Pending",
    createdAt: new Date().toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 5).toISOString(),
    trackingCode: `TRK-${String(orderSeq).padStart(4, "0")}`,
  };

  ordersState = [newOrder, ...ordersState];
  cartState = [];
  return clone(newOrder);
}

export async function getRewardsData(): Promise<RewardsData> {
  await sleep(MOCK_LATENCY_MS);
  const now = Date.now();

  const leadsWithStatus: RewardsLead[] = rewardsState.leads.map((lead) => {
    if (lead.refunded) {
      return { ...lead, status: "Refunded" };
    }

    if (!lead.deliveryDate) {
      return { ...lead, status: "Clicked" };
    }

    const deliveryTs = new Date(lead.deliveryDate).getTime();
    const daysSinceDelivery = (now - deliveryTs) / MS_PER_DAY;
    // "Safe zone" rule: successful only when days > 15 and not refunded.
    const status = daysSinceDelivery > 15 ? "Paid" : "Pending";
    return { ...lead, status };
  });

  const referralCount = leadsWithStatus.filter((l) => l.status === "Paid").length;

  return {
    referralCount,
    target: rewardsState.target,
    referralLink: rewardsState.referralLink,
    leads: leadsWithStatus,
  };
}

export async function setLeadRefunded(phone: string, refunded: boolean): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  const lead = rewardsState.leads.find((l) => l.phone === phone);
  if (!lead) throw new Error("Lead not found (mock)");
  lead.refunded = refunded;
}

export async function getSession(): Promise<Session> {
  await sleep(MOCK_LATENCY_MS);
  return {
    loggedIn: sessionState.loggedIn,
    role: sessionState.role,
    email: sessionState.email,
    onboardingComplete: sessionState.onboardingComplete,
    onboarding: sessionState.onboarding,
  };
}

export async function login(input: { email: string; password: string }): Promise<Session> {
  await sleep(MOCK_LATENCY_MS);
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const isAdmin = email === "admin@hasee.com" && password === "admin123";
  const isCustomer = email === "user@test.com" && password === "user123";

  if (!isAdmin && !isCustomer) throw new Error("Invalid credentials (mock)");

  const role: Role = isAdmin ? "ADMIN" : "CUSTOMER";
  const onboardingComplete = role === "ADMIN";

  sessionState = {
    ...sessionState,
    loggedIn: true,
    role,
    email,
    userName: role === "ADMIN" ? "Hasee Admin" : "Hasee User",
    onboardingComplete,
    onboarding: undefined,
  };

  return {
    loggedIn: true,
    role,
    email: sessionState.email,
    onboardingComplete: sessionState.onboardingComplete,
    onboarding: sessionState.onboarding,
  };
}

export async function completeOnboarding(input: OnboardingData): Promise<Session> {
  await sleep(MOCK_LATENCY_MS);
  if (!sessionState.loggedIn) throw new Error("Login required (mock)");

  sessionState = {
    ...sessionState,
    onboardingComplete: true,
    onboarding: input,
    userName: input.name,
    email: input.email ? input.email : sessionState.email,
    whatsappNumber: input.whatsappNumber,
    phoneNumber: input.phoneNumber ?? undefined,
    location: input.location,
    favoriteColors: input.favoriteColors ?? [],
  };

  return {
    loggedIn: sessionState.loggedIn,
    role: sessionState.role,
    email: sessionState.email,
    onboardingComplete: true,
    onboarding: sessionState.onboarding,
  };
}

export async function getProfile(): Promise<{
  userName: string;
  email: string;
  whatsappNumber: string | undefined;
  phoneNumber: string | undefined;
  location: string | undefined;
  favoriteColors: string[];
  profilePhotoUrl?: string;
}> {
  await sleep(MOCK_LATENCY_MS);
  return {
    userName: sessionState.userName,
    email: sessionState.email,
    whatsappNumber: sessionState.whatsappNumber,
    phoneNumber: sessionState.phoneNumber,
    location: sessionState.location,
    favoriteColors: sessionState.favoriteColors,
    profilePhotoUrl: sessionState.profilePhotoUrl,
  };
}

export async function updateProfile(input: {
  userName?: string;
  email?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  location?: string;
  favoriteColors?: string[];
  profilePhotoUrl?: string | undefined;
}): Promise<{
  userName: string;
  email: string;
  whatsappNumber: string | undefined;
  phoneNumber: string | undefined;
  location: string | undefined;
  favoriteColors: string[];
  profilePhotoUrl?: string;
}> {
  await sleep(MOCK_LATENCY_MS);
  if (Object.prototype.hasOwnProperty.call(input, "userName")) sessionState = { ...sessionState, userName: input.userName };
  if (Object.prototype.hasOwnProperty.call(input, "email")) sessionState = { ...sessionState, email: input.email };
  if (Object.prototype.hasOwnProperty.call(input, "whatsappNumber")) sessionState = { ...sessionState, whatsappNumber: input.whatsappNumber };
  if (Object.prototype.hasOwnProperty.call(input, "phoneNumber")) sessionState = { ...sessionState, phoneNumber: input.phoneNumber };
  if (Object.prototype.hasOwnProperty.call(input, "location")) sessionState = { ...sessionState, location: input.location };
  if (Object.prototype.hasOwnProperty.call(input, "favoriteColors")) sessionState = { ...sessionState, favoriteColors: input.favoriteColors ?? [] };
  if (Object.prototype.hasOwnProperty.call(input, "profilePhotoUrl")) sessionState = { ...sessionState, profilePhotoUrl: input.profilePhotoUrl };

  return {
    userName: sessionState.userName,
    email: sessionState.email,
    whatsappNumber: sessionState.whatsappNumber,
    phoneNumber: sessionState.phoneNumber,
    location: sessionState.location,
    favoriteColors: sessionState.favoriteColors,
    profilePhotoUrl: sessionState.profilePhotoUrl,
  };
}

export async function getDeliveryAddresses(): Promise<DeliveryAddress[]> {
  await sleep(MOCK_LATENCY_MS);
  return clone(addressesState);
}

export async function addDeliveryAddress(input: Omit<DeliveryAddress, "id">): Promise<DeliveryAddress[]> {
  await sleep(MOCK_LATENCY_MS);

  const newAddress: DeliveryAddress = {
    ...input,
    id: `addr-${Date.now()}`,
  };

  // If this is marked as default, unset previous defaults.
  if (newAddress.isDefault) {
    addressesState = addressesState.map((a) => ({ ...a, isDefault: false }));
  }

  addressesState = [newAddress, ...addressesState];
  return clone(addressesState);
}

export async function updateDeliveryAddress(input: { id: string } & Partial<Omit<DeliveryAddress, "id">>): Promise<DeliveryAddress[]> {
  await sleep(MOCK_LATENCY_MS);

  addressesState = addressesState.map((a) => {
    if (a.id !== input.id) return a;
    return { ...a, ...input };
  });

  // If any address is marked as default, ensure only one default.
  const hasDefault = addressesState.some((a) => a.isDefault);
  if (hasDefault) {
    addressesState = addressesState.map((a) => ({ ...a, isDefault: a.id === input.id ? !!a.isDefault : false }));
  }

  return clone(addressesState);
}

export async function deleteDeliveryAddress(id: string): Promise<DeliveryAddress[]> {
  await sleep(MOCK_LATENCY_MS);
  addressesState = addressesState.filter((a) => a.id !== id);
  // If list is empty or no default, keep first as default (best-effort).
  if (addressesState.length > 0 && !addressesState.some((a) => a.isDefault)) {
    addressesState = addressesState.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }
  return clone(addressesState);
}

export async function getSettings(): Promise<SettingsData> {
  await sleep(MOCK_LATENCY_MS);
  return clone(settingsState);
}

export async function updateSettings(input: Partial<SettingsData>): Promise<SettingsData> {
  await sleep(MOCK_LATENCY_MS);
  settingsState = { ...settingsState, ...input };
  return clone(settingsState);
}

export async function getWishlistProducts(): Promise<Product[]> {
  await sleep(MOCK_LATENCY_MS);
  const wishlisted = products.filter((p) => likedProductIds.has(p.id));
  return clone(wishlisted);
}

export async function logout(): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  sessionState = { ...sessionState, loggedIn: false };
}

