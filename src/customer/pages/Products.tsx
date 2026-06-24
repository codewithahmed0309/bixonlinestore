import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Product, productsApi } from "../../api/api";
import { DEMO_CATEGORIES } from "../data/categories";
import ProductCard from "../components/ProductCard";

const normalize = (value?: string) =>
  (value || "").toLowerCase().replace(/[\s_-]+/g, "");

const matchesCategory = (product: Product, slug: string): boolean => {
  if (!slug) return true;
  const category = DEMO_CATEGORIES.find((c) => c.slug === slug);
  const target = normalize(slug);
  const targetName = normalize(category?.name);
  const productCat = normalize(product.category);
  return productCat === target || productCat === targetName;
};

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productsApi
      .list()
      .then((res) => {
        if (mounted) {
          setProducts(res.data?.data || []);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) setError("Could not load products. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => matchesCategory(p, activeCategory)),
    [products, activeCategory]
  );

  const setCategory = (slug: string) => {
    if (slug) setSearchParams({ category: slug });
    else setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Products</h1>
      <p className="mt-1 text-sm text-slate-500">
        {activeCategory
          ? `Showing ${filtered.length} product(s) in this category`
          : "Explore our full collection"}
      </p>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-emerald-600 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        {DEMO_CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(c.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === c.slug
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="mt-10 text-sm text-slate-500">Loading products…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-rose-500">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-base font-medium text-slate-700">
            No products found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {activeCategory
              ? "There are no products in this category yet."
              : "Products added in the admin panel will appear here automatically."}
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
