import React from "react";
import { useNavigate } from "react-router-dom";
import { DemoCategory } from "../data/categories";

const CategoryCard: React.FC<{ category: DemoCategory }> = ({ category }) => {
  const navigate = useNavigate();

  const goToCategory = () =>
    navigate(`/products?category=${encodeURIComponent(category.slug)}`);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl">
        <span aria-hidden>{category.emoji}</span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {category.name}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{category.description}</p>
      <button
        type="button"
        onClick={goToCategory}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
      >
        Shop Now
      </button>
    </div>
  );
};

export default CategoryCard;
