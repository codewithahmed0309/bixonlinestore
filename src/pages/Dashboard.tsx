import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProducts } from "../contexts/ProductsContext";

const StatCard: React.FC<{ label: string; value: string; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
    <p className="text-xl sm:text-2xl font-semibold text-slate-100 mt-2">{value}</p>
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

const Dashboard: React.FC = () => {
  const { admin } = useAuth();
  const { products, isLoading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts(); // no-op if already cached/fresh — shared with Products page
  }, [fetchProducts]);

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 5).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
      <h2 className="text-slate-100 text-lg sm:text-xl font-semibold">
   RAHI STORE Admin Panel
</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage your products, inventory, and reseller business 
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Products" value={isLoading ? "…" : String(products.length)} />
        <StatCard label="Units in Stock" value={isLoading ? "…" : String(totalStock)} />
        <StatCard
          label="Low Stock"
          value={isLoading ? "…" : String(lowStockCount)}
          hint="5 units or fewer"
        />
        <StatCard
          label="Inventory Value"
          value={isLoading ? "…" : `₹. ${totalValue.toLocaleString()}`}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-slate-200 font-medium mb-4">Recently Added</h3>

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-slate-500">
            No products have been added yet. Start by adding your first product to the store.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {products.slice(0, 5).map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between text-sm gap-3">
                <span className="text-slate-200 truncate">{p.name}</span>
                <span className="text-slate-500 shrink-0">₹. {p.price?.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
