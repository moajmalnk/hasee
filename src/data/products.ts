export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  // Back-compat field; prefer `imageArray[0]` when rendering.
  image: string;
  imageArray: string[];
  videoUrl?: string;
  availableColors: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "Rayon Maxi",
    price: 380,
    category: "Rayon",
    imageArray: [
      "https://placehold.co/400x600/pink/white?text=Rayon+Maxi+Front",
      "https://placehold.co/400x600/FFB6C1/white?text=Rayon+Maxi+Back",
      "https://placehold.co/400x600/FFC0CB/white?text=Rayon+Maxi+Detail",
    ],
    image: "https://placehold.co/400x600/pink/white?text=Rayon+Maxi+Front",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    availableColors: ["Red", "Blue", "Green", "Black", "White"],
  },
  {
    id: 2,
    name: "Dubai Silk Maxi",
    price: 550,
    category: "Dubai",
    imageArray: [
      "https://placehold.co/400x600/8A2BE2/white?text=Dubai+Silk+Front",
      "https://placehold.co/400x600/9932CC/white?text=Dubai+Silk+Back",
      "https://placehold.co/400x600/C19A6B/white?text=Dubai+Silk+Detail",
    ],
    image: "https://placehold.co/400x600/8A2BE2/white?text=Dubai+Silk+Front",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    availableColors: ["Gold", "Black", "Maroon"],
  },
  {
    id: 3,
    name: "Cotton 60 Maxi",
    price: 290,
    category: "Cotton",
    imageArray: [
      "https://placehold.co/400x600/2E8B57/white?text=Cotton+60+Front",
      "https://placehold.co/400x600/3CB371/white?text=Cotton+60+Back",
      "https://placehold.co/400x600/7CFC00/white?text=Cotton+60+Detail",
    ],
    image: "https://placehold.co/400x600/2E8B57/white?text=Cotton+60+Front",
    availableColors: ["Cream", "Sky Blue", "Forest Green"],
  },
  {
    id: 4,
    name: "Alpine Breathable Maxi",
    price: 300,
    category: "Alpine",
    imageArray: [
      "https://placehold.co/400x600/00BFFF/white?text=Alpine+Maxi+Front",
      "https://placehold.co/400x600/1E90FF/white?text=Alpine+Maxi+Back",
      "https://placehold.co/400x600/87CEFA/white?text=Alpine+Maxi+Detail",
    ],
    image: "https://placehold.co/400x600/00BFFF/white?text=Alpine+Maxi+Front",
    availableColors: ["Navy", "Light Blue", "White"],
  },
  {
    id: 5,
    name: "Chiffon Party Maxi",
    price: 480,
    category: "Chiffon",
    imageArray: [
      "https://placehold.co/400x600/FF69B4/white?text=Chiffon+Maxi+Front",
      "https://placehold.co/400x600/FF7F50/white?text=Chiffon+Maxi+Back",
      "https://placehold.co/400x600/F4A460/white?text=Chiffon+Maxi+Detail",
    ],
    image: "https://placehold.co/400x600/FF69B4/white?text=Chiffon+Maxi+Front",
    availableColors: ["Rose", "Peach", "Champagne"],
  },
  {
    id: 6,
    name: "Linen Summer Maxi",
    price: 420,
    category: "Linen",
    imageArray: [
      "https://placehold.co/400x600/F5DEB3/white?text=Linen+Maxi+Front",
      "https://placehold.co/400x600/DEB887/white?text=Linen+Maxi+Back",
      "https://placehold.co/400x600/D2B48C/white?text=Linen+Maxi+Detail",
    ],
    image: "https://placehold.co/400x600/F5DEB3/white?text=Linen+Maxi+Front",
    availableColors: ["Sand", "Beige", "Olive"],
  },
];
