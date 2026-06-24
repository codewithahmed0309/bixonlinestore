import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product } from "../../api/api";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  totalItems: number;
  grandTotal: number;
  isInCart: (id: string) => boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_KEY = "rahi_store_cart";

const safeParse = (value: string | null): CartItem[] => {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() =>
    safeParse(
      typeof window !== "undefined" ? localStorage.getItem(CART_KEY) : null
    )
  );

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart: CartContextValue["addToCart"] = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const maxStock = Number(product.stock) || 0;

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxStock || existing.quantity + quantity);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: nextQty } : i
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image,
          stock: maxStock,
          quantity: Math.min(quantity, maxStock || quantity),
        },
      ];
    });
  };

  const removeFromCart = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const increaseQuantity = (id: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity: i.stock ? Math.min(i.quantity + 1, i.stock) : i.quantity + 1,
            }
          : i
      )
    );

  const decreaseQuantity = (id: string) =>
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );

  const clearCart = () => setItems([]);

  const isInCart = (id: string) => items.some((i) => i.id === id);

  const totalQuantity = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalItems = items.length;

  const grandTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      totalItems,
      grandTotal,
      isInCart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
    }),
    [items, totalQuantity, totalItems, grandTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
