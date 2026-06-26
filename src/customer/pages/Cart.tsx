import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CURRENCY } from "../config/store";
import { buildCartMessage, openWhatsApp } from "../utils/whatsapp";
import {
  CartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  WhatsAppIcon,
} from "../components/icons";

const Cart: React.FC = () => {
  const {
    items,
    totalItems,
    totalQuantity,
    grandTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const handleProceed = () => {
    if (items.length === 0) return;
    openWhatsApp(buildCartMessage(items, grandTotal));
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <CartIcon width={32} height={32} />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Add some products to get started.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-yellow-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <Link
                  to={`/products/${item.id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <CartIcon width={28} height={28} />
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/products/${item.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-yellow-600"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      aria-label="Remove product"
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <TrashIcon width={18} height={18} />
                    </button>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {CURRENCY}
                    {item.price} each
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-lg border border-slate-300">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => decreaseQuantity(item.id)}
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-50"
                      >
                        <MinusIcon width={15} height={15} />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => increaseQuantity(item.id)}
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-50"
                      >
                        <PlusIcon width={15} height={15} />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {CURRENCY}
                      {item.price * item.quantity}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Products</dt>
                <dd className="font-semibold text-slate-900">{totalItems}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Quantity</dt>
                <dd className="font-semibold text-slate-900">{totalQuantity}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <dt className="text-base font-semibold text-slate-900">
                  Grand Total
                </dt>
                <dd className="text-base font-extrabold text-slate-900">
                  {CURRENCY}
                  {grandTotal}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleProceed}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
            >
              <WhatsAppIcon width={18} height={18} />
              Proceed
            </button>

            <Link
              to="/products"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
