export interface DemoCategory {
  slug: string;
  name: string;
  description: string;
  emoji: string;
}

/* Demo categories used for the storefront navigation. Selecting one filters the
   Products page by the `category` field on real products from the backend. */
export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Phones, laptops, gadgets & more",
    emoji: "💻",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Everyday add-ons and essentials",
    emoji: "🎧",
  },
  {
    slug: "home-essentials",
    name: "Home Essentials",
    description: "Make your space comfortable",
    emoji: "🏠",
  },
  {
    slug: "fashion",
    name: "Fashion",
    description: "Trending styles and apparel",
    emoji: "👕",
  },
];
