export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

export const products: Product[] = [
  { id: 1, name: "Premium Rayon Maxi", price: 380, category: "Rayon", image: "https://placehold.co/400x600/pink/white?text=Rayon+Maxi" },
  { id: 2, name: "Dubai Silk Maxi", price: 550, category: "Dubai", image: "https://placehold.co/400x600/pink/white?text=Dubai+Maxi" },
  { id: 3, name: "Pure Cotton Maxi", price: 280, category: "Cotton", image: "https://placehold.co/400x600/pink/white?text=Cotton+Maxi" },
  { id: 4, name: "Alpine Breathable Maxi", price: 300, category: "Alpine", image: "https://placehold.co/400x600/pink/white?text=Alpine+Maxi" },
  { id: 5, name: "Chiffon Party Maxi", price: 480, category: "Chiffon", image: "https://placehold.co/400x600/pink/white?text=Chiffon+Maxi" },
  { id: 6, name: "Linen Summer Maxi", price: 420, category: "Linen", image: "https://placehold.co/400x600/pink/white?text=Linen+Maxi" },
];
