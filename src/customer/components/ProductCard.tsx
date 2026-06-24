import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../../api/api";
import { useCart } from "../context/CartContext";
import { CURRENCY } from "../config/store";
import { buildProductMessage, openWhatsApp } from "../utils/whatsapp";
import { CartIcon, WhatsAppIcon } from "./icons";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const inStock = Number(product.stock) > 0;
  const inCart = isInCart(product.id);

  const handleBuyNow = () => {
    openWhatsApp(buildProductMessage(product, 1));
  };

  const handleCart = () => {
    if (inCart) {
      navigate("/cart");
    } else if (inStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-slate-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <CartIcon width={48} height={48} />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-yellow-600">
            {product.name}
          </h3>
        </Link>
        {product.brand && (
          <p className="mt-0.5 text-xs text-slate-400">{product.brand}</p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-slate-900">
            {CURRENCY}
            {product.price}
          </p>
          <span
            className={`text-xs font-medium ${
              inStock ? "text-yellow-600" : "text-rose-500"
            }`}
          >
            {inStock ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <WhatsAppIcon width={16} height={16} />
            Buy Now
          </button>

          <button
            type="button"
            onClick={handleCart}
            disabled={!inStock && !inCart}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              inCart
                ? "border-emerald-600 bg-yellow-50 text-emerald-700 hover:bg-yellow-100"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            <CartIcon width={16} height={16} />
            {inCart ? "Go To Cart" : "Add To Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
