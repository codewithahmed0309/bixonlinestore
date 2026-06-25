import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product, productsApi } from "../../api/api";
import { DEMO_CATEGORIES } from "../data/categories";
import { STORE_NAME } from "../config/store";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import LoaderScreen from "../../components/LoaderScreen";


const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productsApi
      .list()
      .then((res) => {
        if (mounted) setFeatured((res.data?.data || []).slice(0, 4));
      })
      .catch(() => {
        if (mounted) setFeatured([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-yellow-600 via-yellow-700 to-amber-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {STORE_NAME}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Tijarat mein Imandari, aur Zindagi mein Barkat.
            </h1>
            <p className="mt-5 max-w-xl text-base text-yellow-50 sm:text-lg">
  Sachcha aur imandaar Tajir Ambiya, Siddiqin aur Shohada ke saath hoga.
  
  <span className="block mt-2 text-sm text-yellow-200">
     al-Tirmidhi 1209
  </span>
</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-yellow-700 shadow-sm transition-colors hover:bg-yellow-50"
              >
                Shop Now
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Find exactly what you need
            </p>
          </div>
          <Link
            to="/categories"
            className="text-sm font-semibold text-yellow-600 hover:text-yellow-700"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fresh from our store
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-yellow-600 hover:text-yellow-700"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <LoaderScreen />
        ) : featured.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500">
            No products available yet. Please check back soon.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
