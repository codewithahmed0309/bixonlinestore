import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Product, productsApi } from "../../api/api";
import { categoriesApi } from "../../api/CategoryApi";
import ProductCard from "../components/ProductCard";
import LoaderScreen from "../../components/LoaderScreen";

// -----------------------------
// Types
// -----------------------------
type UI_Category = {
  id: string;
  name: string;
  slug: string;
};

// -----------------------------
// Utils
// -----------------------------
const normalize = (value?: string) =>
  (value || "").toLowerCase().replace(/[\s_-]+/g, "");

// -----------------------------
// Component
// -----------------------------
const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<UI_Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    Promise.all([productsApi.list(), categoriesApi.list()])
      .then(([productsRes, categoriesRes]) => {
        if (!mounted) return;

        // PRODUCTS
        setProducts(productsRes.data?.data || []);

        // CATEGORIES
        const rawCategories = categoriesRes.data?.data || [];

        const formattedCategories: UI_Category[] = rawCategories.map(
          (c: any) => ({
            id: c.id,
            name: c.name,
            slug: normalize(c.name),
          })
        );

        setCategories(formattedCategories);
        setError(null);
      })
      .catch(() => {
        if (mounted) {
          setError("Could not load products. Please try again.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // -----------------------------
  // Filter logic
  // -----------------------------
  const filtered = useMemo(() => {
    if (!activeCategory) return products;

    const target = normalize(activeCategory);

    return products.filter((p) => {
      const productCategory = normalize(p.category);

      const matchedCategory = categories.find((c) => c.slug === target);

      if (!matchedCategory) return false;

      return productCategory === normalize(matchedCategory.name);
    });
  }, [products, categories, activeCategory]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Products</h1>

      <p className="mt-1 text-sm text-slate-500">
        {activeCategory
          ? `Showing ${filtered.length} product(s) in this category`
          : "Explore our full collection"}
      </p>

      {/* CATEGORY FILTER */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSearchParams({})}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !activeCategory
              ? "bg-yellow-600 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSearchParams({ category: c.slug })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              activeCategory === c.slug
                ? "bg-yellow-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoaderScreen />
      ) : error ? (
        <p className="mt-10 text-sm text-rose-500">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-base font-medium text-slate-700">
            No products found
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;  
