import React from "react";
import { DEMO_CATEGORIES } from "../data/categories";
import CategoryCard from "../components/CategoryCard";

const Categories: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a category to start shopping.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_CATEGORIES.map((c) => (
          <CategoryCard key={c.slug} category={c} />
        ))}
      </div>
    </div>
  );
};

export default Categories;
