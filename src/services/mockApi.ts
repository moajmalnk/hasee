import { communityPosts, mockReviews, productLikes, type CommunityPost, type Review } from "@/data/mockData";
import { products, type Product } from "@/data/products";
import type { OnboardingData, Role, Session } from "@/auth/types";

type OrderStatus = "Pending" | "Approved" | "Rejected";

export type MockOrder = {
  id: string;
  productId: number;
  productName: string;
  amount: number;
  customer: string;
  status: OrderStatus;
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
    productId: 1,
    productName: "Rayon Maxi",
    amount: 380,
    customer: "Aisha K.",
    status: "Pending",
    createdAt: new Date(Date.now() - MS_PER_DAY * 1).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 4).toISOString(),
    trackingCode: "TRK-8821",
  },
  {
    id: "#8822",
    productId: 2,
    productName: "Dubai Silk Maxi",
    amount: 550,
    customer: "Priya M.",
    status: "Pending",
    createdAt: new Date(Date.now() - MS_PER_DAY * 2).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 3).toISOString(),
    trackingCode: "TRK-8822",
  },
  {
    id: "#8823",
    productId: 3,
    productName: "Cotton Maxi",
    amount: 280,
    customer: "Fatima R.",
    status: "Pending",
    createdAt: new Date(Date.now() - MS_PER_DAY * 0.5).toISOString(),
    expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 5).toISOString(),
    trackingCode: "TRK-8823",
  },
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
    // Delivered >= 15 days ago -> Paid
    { phone: "9947428821", name: "Aisha K.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 20).toISOString() },
    { phone: "8765123456", name: "Priya M.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 18).toISOString() },
    { phone: "8912345678", name: "Fatima R.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 30).toISOString(), refunded: true },
    { phone: "8833123412", name: "Zainab A.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 16).toISOString() },
    { phone: "7744123450", name: "Noor S.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 17).toISOString() },
    { phone: "6655123409", name: "Sara J.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 25).toISOString() },

    // Delivered < 15 days ago -> Pending
    { phone: "9876543210", name: "Meena T.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 5).toISOString() },
    { phone: "9123456789", name: "Hina P.", deliveryDate: new Date(Date.now() - MS_PER_DAY * 9).toISOString() },

    // No deliveryDate -> Clicked
    { phone: "7654321098", name: "Aamna N." },
    { phone: "5544332211", name: "Rashmi V." },
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
  const now = new Date();
  ordersState = ordersState.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status: "Approved",
          approvedAt: now.toISOString(),
          // After approval, estimate delivery for 2 more days.
          expectedDeliveryAt: new Date(Date.now() + MS_PER_DAY * 2).toISOString(),
        }
      : o,
  );
}

export async function rejectOrder(orderId: string): Promise<void> {
  await sleep(MOCK_LATENCY_MS);
  const now = new Date();
  ordersState = ordersState.map((o) => (o.id === orderId ? { ...o, status: "Rejected", rejectedAt: now.toISOString() } : o));
}

export async function getCart(): Promise<MockCartItem[]> {
  await sleep(MOCK_LATENCY_MS);
  return clone(cartState);
}

export async function addToCart(input: { productId: number; qty: number; size: string }): Promise<MockCartItem[]> {
  await sleep(MOCK_LATENCY_MS);
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
  await sleep(MOCK_LATENCY_MS);
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
    const status = daysSinceDelivery < 15 ? "Pending" : "Paid";
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

