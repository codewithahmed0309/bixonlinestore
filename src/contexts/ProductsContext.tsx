import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Product, productsApi } from "../api/api";

interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (force?: boolean) => Promise<void>;
  addProduct: (formData: FormData) => Promise<Product>;
  editProduct: (id: string, formData: FormData) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

// How long cached data is considered fresh before a route revisit re-fetches it.
const STALE_TIME_MS = 60_000;

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFetchedAt = useRef(0);
  const hasFetchedOnce = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null);

  const fetchProducts = useCallback(async (force = false) => {
    const isFresh =
      hasFetchedOnce.current && Date.now() - lastFetchedAt.current < STALE_TIME_MS;

    if (!force && isFresh) return; // serve from cache — no network call

    if (inFlight.current) return inFlight.current; // dedupe concurrent calls

    const run = (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await productsApi.list();
        const safeData = Array.isArray(res.data?.data) ? res.data.data : [];
        setProducts(safeData);
        lastFetchedAt.current = Date.now();
        hasFetchedOnce.current = true;
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(err?.message || "Could not load products. Please try again.");
      } finally {
        setIsLoading(false);
        inFlight.current = null;
      }
    })();

    inFlight.current = run;
    return run;
  }, []);

  const addProduct = useCallback(async (formData: FormData) => {
    const res = await productsApi.create(formData);
    const created = res.data.data;
    setProducts((prev) => [created, ...prev]);
    return created;
  }, []);

  const editProduct = useCallback(async (id: string, formData: FormData) => {
    const res = await productsApi.update(id, formData);
    const updated = res.data.data;
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    await productsApi.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value = useMemo(
    () => ({ products, isLoading, error, fetchProducts, addProduct, editProduct, removeProduct }),
    [products, isLoading, error, fetchProducts, addProduct, editProduct, removeProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProducts = (): ProductsContextValue => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
};