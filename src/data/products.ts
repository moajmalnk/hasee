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
      "/maxi/Rayon%20Maxi.jpg",
      "/maxi/Rayon%20Maxi.jpg",
      "/maxi/Rayon%20Maxi.jpg",
    ],
    image: "/maxi/Rayon%20Maxi.jpg",
    availableColors: ["Red", "Blue", "Green", "Black", "White"],
  },
  {
    id: 2,
    name: "Dubai Silk Maxi",
    price: 550,
    category: "Dubai",
    imageArray: [
      "/maxi/Dubai%20Silk%20Maxi.jpeg",
      "/maxi/Dubai%20Silk%20Maxi.jpeg",
      "/maxi/Dubai%20Silk%20Maxi.jpeg",
    ],
    image: "/maxi/Dubai%20Silk%20Maxi.jpeg",
    availableColors: ["Gold", "Black", "Maroon"],
  },
  {
    id: 3,
    name: "Cotton 60 Maxi",
    price: 290,
    category: "Cotton",
    imageArray: [
      "/maxi/Cotton%2060%20Maxi.webp",
      "/maxi/Cotton%2060%20Maxi.webp",
      "/maxi/Cotton%2060%20Maxi.webp",
    ],
    image: "/maxi/Cotton%2060%20Maxi.webp",
    availableColors: ["Cream", "Sky Blue", "Forest Green"],
  },
  {
    id: 4,
    name: "Alpine Breathable Maxi",
    price: 300,
    category: "Alpine",
    imageArray: [
      "/maxi/Alpine%20Breathable%20Maxi.jpg",
      "/maxi/Alpine%20Breathable%20Maxi.jpg",
      "/maxi/Alpine%20Breathable%20Maxi.jpg",
    ],
    image: "/maxi/Alpine%20Breathable%20Maxi.jpg",
    availableColors: ["Navy", "Light Blue", "White"],
  },
  {
    id: 5,
    name: "Chiffon Party Maxi",
    price: 480,
    category: "Chiffon",
    imageArray: [
      "/maxi/Chiffon%20Party%20Maxi.webp",
      "/maxi/Chiffon%20Party%20Maxi.webp",
      "/maxi/Chiffon%20Party%20Maxi.webp",
    ],
    image: "/maxi/Chiffon%20Party%20Maxi.webp",
    availableColors: ["Rose", "Peach", "Champagne"],
  },
  {
    id: 6,
    name: "Linen Summer Maxi",
    price: 420,
    category: "Linen",
    imageArray: [
      "/maxi/Linen%20Summer%20Maxi.avif",
      "/maxi/Linen%20Summer%20Maxi.avif",
      "/maxi/Linen%20Summer%20Maxi.avif",
    ],
    image: "/maxi/Linen%20Summer%20Maxi.avif",
    availableColors: ["Sand", "Beige", "Olive"],
  },
];
