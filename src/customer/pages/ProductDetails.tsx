import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Product, productsApi } from "../../api/api";
import { useCart } from "../context/CartContext";
import { CURRENCY } from "../config/store";
import { buildProductMessage, openWhatsApp } from "../utils/whatsapp";
import {
  ArrowLeftIcon,
  CartIcon,
  MinusIcon,
  PlusIcon,
  WhatsAppIcon,
} from "../components/icons";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productsApi
      .list()
      .then((res) => {
        if (!mounted) return;
        const found = (res.data?.data || []).find((p) => p.id === id) || null;
        setProduct(found);
      })
      .catch(() => mounted && setProduct(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const inStock = useMemo(() => Number(product?.stock) > 0, [product]);
  const inCart = product ? isInCart(product.id) : false;
  const maxQty = Number(product?.stock) || 1;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-slate-500 sm:px-6 lg:px-8">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-base font-medium text-slate-700">Product not found</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeftIcon width={16} height={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const handleBuyNow = () =>
    openWhatsApp(buildProductMessage(product, quantity));

  const handleCart = () => {
    if (inCart) {
      navigate("/cart");
    } else {
      addToCart(product, quantity);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Back to Products
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-square w-full bg-slate-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <CartIcon width={64} height={64} />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {product.category}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            {product.name}
          </h1>
          {product.brand && (
            <p className="mt-1 text-sm text-slate-500">by {product.brand}</p>
          )}

         <p className="mt-5 text-3xl font-extrabold text-slate-900">
  {CURRENCY}
  {product.sale_price}
</p>

{product.original_price > product.sale_price && (
  <p className="text-sm text-slate-500 line-through">
    {CURRENCY}{product.original_price}
  </p>
)}

          <p
            className={`mt-2 text-sm font-medium ${
              inStock ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {inStock ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Quantity</span>
            <div className="inline-flex items-center rounded-lg border border-slate-300">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!inStock}
                className="px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <MinusIcon width={16} height={16} />
              </button>
              <span className="w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={!inStock}
                className="px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <PlusIcon width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <WhatsAppIcon width={18} height={18} />
              Buy Now
            </button>
            <button
              type="button"
              onClick={handleCart}
              disabled={!inStock && !inCart}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                inCart
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              <CartIcon width={18} height={18} />
              {inCart ? "Go To Cart" : "Add To Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
