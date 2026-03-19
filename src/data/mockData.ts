export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  photo?: string;
  verified: boolean;
  date: string;
  approved: boolean;
}

export interface CommunityPost {
  id: number;
  userName: string;
  userAvatar: string;
  image: string;
  caption: string;
  likes: number;
  productName: string;
  date: string;
  // Admin moderation: only approved posts appear on the public homepage.
  approved?: boolean;
  featured?: boolean;
}

export const mockReviews: Review[] = [
  { id: 1, productId: 1, userName: "Aisha K.", rating: 5, comment: "Absolutely love this maxi! The fabric is so soft and breathable. Perfect for summer outings.", verified: true, date: "2 days ago", approved: true },
  { id: 2, productId: 1, userName: "Priya M.", rating: 4, comment: "Great quality for the price. Fits perfectly in XL. Will order more colors!", verified: true, date: "5 days ago", approved: true },
  { id: 3, productId: 2, userName: "Fatima R.", rating: 5, comment: "The Dubai Silk is gorgeous. Got so many compliments at a family gathering!", photo: "https://placehold.co/200x200/pink/white?text=Review+Photo", verified: true, date: "1 week ago", approved: true },
  { id: 4, productId: 3, userName: "Zainab A.", rating: 4, comment: "Comfortable cotton, washes well. Slight color fade after 3rd wash though.", verified: true, date: "2 weeks ago", approved: true },
  { id: 5, productId: 2, userName: "Noor S.", rating: 5, comment: "Premium quality! Worth every rupee.", verified: false, date: "3 days ago", approved: false },
];

export const communityPosts: CommunityPost[] = [
  { id: 1, userName: "Aisha K.", userAvatar: "AK", image: "https://placehold.co/600x800/FFB6C1/white?text=Customer+Style+1", caption: "Loving my new Rayon Maxi for weekend brunch! 💕", likes: 47, productName: "Premium Rayon Maxi", date: "2h ago", approved: true, featured: true },
  { id: 2, userName: "Priya M.", userAvatar: "PM", image: "https://placehold.co/600x800/FFC0CB/white?text=Customer+Style+2", caption: "Dubai Silk for the wedding season ✨", likes: 124, productName: "Dubai Silk Maxi", date: "5h ago", approved: false, featured: false },
  { id: 3, userName: "Fatima R.", userAvatar: "FR", image: "https://placehold.co/600x800/FFD1DC/white?text=Customer+Style+3", caption: "Cotton comfort all day long 🌸", likes: 89, productName: "Pure Cotton Maxi", date: "1d ago", approved: true, featured: false },
  { id: 4, userName: "Zainab A.", userAvatar: "ZA", image: "https://placehold.co/600x800/FADADD/white?text=Customer+Style+4", caption: "My go-to maxi for everything casual!", likes: 56, productName: "Alpine Breathable Maxi", date: "2d ago", approved: false, featured: false },
  { id: 5, userName: "Sara J.", userAvatar: "SJ", image: "https://placehold.co/600x800/F8C8DC/white?text=Customer+Style+5", caption: "Chiffon party look 🎉", likes: 201, productName: "Chiffon Party Maxi", date: "3d ago", approved: true, featured: false },
];

export const productLikes: Record<number, number> = {
  1: 124,
  2: 287,
  3: 96,
  4: 73,
  5: 198,
  6: 145,
  7: 64,
  8: 220,
  9: 88,
  10: 101,
  11: 176,
  12: 132,
};
