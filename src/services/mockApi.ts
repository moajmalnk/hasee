import { communityPosts, mockReviews, productLikes, type CommunityPost, type Review } from "@/data/mockData";
import { products, type Product } from "@/data/products";

type OrderStatus = "Pending" | "Approved" | "Rejected";

export type MockOrder = {
  id: string;
  productId: number;
  productName: string;
  amount: number;
  customer: string;
  status: OrderStatus;
};

export type MockCartItem = {
  productId: number;
  qty: number;
  size: string;
};

export type CommunityPostView = CommunityPost & { liked: boolean };

export type RewardsLead = { phone: string; status: "Paid" | "Pending" | "Clicked" };
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

const MOCK_LATENCY_MS = 240;
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// In-memory "database" for mock behavior.
let reviewsState: Review[] = mockReviews.map((r) => ({ ...r }));
let communityPostsState: CommunityPost[] = communityPosts.map((p) => ({ ...p }));
let productLikesState: Record<number, number> = { ...productLikes };
let likedCommunityPostIds = new Set<number>();
let likedProductIds = new Set<number>();
let ordersState: MockOrder[] = [
  { id: "#8821", productId: 1, productName: "Rayon Maxi", amount: 380, customer: "Aisha K.", status: "Pending" },
  { id: "#8822", productId: 2, productName: "Dubai Silk Maxi", amount: 550, customer: "Priya M.", status: "Pending" },
  { id: "#8823", productId: 3, productName: "Cotton Maxi", amount: 280, customer: "Fatima R.", status: "Pending" },
];
let cartState: MockCartItem[] = [{ productId: 1, qty: 1, size: "L" }];

let reviewIdSeq = Math.max(...mockReviews.map((r) => r.id), 0) + 1;
let orderSeq = Math.max(...ordersState.map((o) => Number(String(o.id).replace("#", ""))), 0) + 1;

let sessionState = {
  loggedIn: true,
  userName: "Hasee User",
  email: "hasee@example.com",
};

let settingsState: SettingsData = {
  notificationsEnabled: true,
  marketingEnabled: false,
  language: "English",
  darkMode: false,
};

let rewardsState: RewardsData = {
  referralCount: 6,
  target: 10,
  referralLink: "https://hasee.in/ref/USR001",
  leads: [
    { phone: "9947xxxx21", status: "Paid" },
    { phone: "9876xxxx43", status: "Pending" },
    { phone: "8765xxxx12", status: "Paid" },
    { phone: "7654xxxx89", status: "Clicked" },
    { phone: "9123xxxx56", status: "Pending" },
    { phone: "8912xxxx34", status: "Paid" },
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
  return clone(newReview);
}

export async function approveReview(reviewId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  reviewsState = reviewsState.map((r) => (r.id === reviewId ? { ...r, approved: true } : r));
}

export async function deleteReview(reviewId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  reviewsState = reviewsState.filter((r) => r.id !== reviewId);
}

export async function getCommunityPosts(): Promise<CommunityPostView[]> {
  await sleep(MOCK_LATENCY_MS);
  return communityPostsState.map((p) => ({ ...p, liked: likedCommunityPostIds.has(p.id) }));
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
  ordersState = ordersState.map((o) => (o.id === orderId ? { ...o, status: "Approved" } : o));
}

export async function rejectOrder(orderId: string): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  ordersState = ordersState.map((o) => (o.id === orderId ? { ...o, status: "Rejected" } : o));
}

export async function getCart(): Promise<MockCartItem[]> {
  await sleep(MOCK_LATENCY_MS);
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
  };

  ordersState = [newOrder, ...ordersState];
  cartState = [];
  return clone(newOrder);
}

export async function getRewardsData(): Promise<RewardsData> {
  await sleep(MOCK_LATENCY_MS);
  return clone(rewardsState);
}

export async function getProfile(): Promise<{ userName: string; email: string }> {
  await sleep(MOCK_LATENCY_MS);
  return { userName: sessionState.userName, email: sessionState.email };
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

