import React, { useEffect, useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";

type FormState = {
  name: string;
  brand: string;
  category: string;
  price: string;
  stock: string;
  image: File | null;
};

const emptyForm: FormState = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  image: null,
};

const Products: React.FC = () => {
  const { products, isLoading, error: contextError, fetchProducts, addProduct, editProduct, removeProduct } =
    useProducts();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    fetchProducts(); // no-op if Dashboard already loaded fresh data
  }, [fetchProducts]);

  const brandOptions = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort() as string[],
    [products]
  );

  const categoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort() as string[],
    [products]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setSuccessMessage(null);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      return "Enter a valid price greater than 0.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      return "Enter a valid stock count (0 or more).";
    if (form.image && form.image.size > 5 * 1024 * 1024) return "Image must be under 5MB.";
    return null;
  };

  const buildFormData = (): FormData => {
    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("brand", form.brand.trim() || "");
    data.append("category", form.category.trim() || "");
    data.append("price", String(Number(form.price)));
    data.append("stock", String(Number(form.stock)));
    if (form.image) data.append("image", form.image);
    return data;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const data = buildFormData();

      if (editingId) {
        await editProduct(editingId, data); // updates shared state instantly
        setSuccessMessage("Product updated successfully!");
      } else {
        await addProduct(data); // updates shared state instantly
        setSuccessMessage("Product added successfully!");
      }

      resetForm();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to save product:", err);
      setFormError(err?.message || "Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: (typeof products)[number]) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      image: null,
    });
    setShowForm(true);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setFormError(null);
    setSuccessMessage(null);

    try {
      await removeProduct(id); // updates shared state instantly
      setSuccessMessage("Product deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setFormError(err?.message || "Failed to delete product. Please try again.");
    }
  };

  const filtered = products.filter((p) => {
    const matchesQuery = (p.name || "").toLowerCase().includes(query.toLowerCase());
    const matchesBrand = !brandFilter || p.brand === brandFilter;
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesQuery && matchesBrand && matchesCategory;
  });

  const displayError = formError || contextError;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-100 text-xl font-semibold">Products</h2>
          <p className="text-slate-500 text-sm mt-1">{products.length} total products</p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
        >
          + Add Product
        </button>
      </div>

      {/* FILTER BAR — stacks on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100"
        />
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100"
        >
          <option value="">All brands</option>
          {brandOptions.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100"
        >
          <option value="">All categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {displayError && (
        <div className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <span>⚠️</span>
          <span>{displayError}</span>
        </div>
      )}

      {successMessage && (
        <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3">
          <h3 className="text-slate-200 font-medium">
            {editingId ? "Edit Product" : "Add New Product"}
          </h3>

          <input
            type="text"
            placeholder="Product Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
          />
          <input
            type="text"
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price *"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              min="0"
              step="0.01"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
            />
            <input
              type="number"
              placeholder="Stock *"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              min="0"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
            />
          </div>

          <label className="border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer text-slate-400 hover:border-amber-500 transition">
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />
            <span className="text-lg">📤</span>
            <span className="mt-1 text-sm font-medium">
              {editingId ? "Replace Image (optional)" : "Upload Image"}
            </span>
            {form.image ? (
              <span className="text-xs mt-1 text-green-400">✓ {form.image.name}</span>
            ) : (
              <span className="text-xs mt-1">PNG, JPG (max 5MB)</span>
            )}
          </label>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-3 rounded font-medium transition disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== DESKTOP/TABLET: TABLE (md and up) ===== */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Brand</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Price</th>
              <th className="px-5 py-3 text-right">Stock</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center p-6 text-slate-500">⏳ Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-slate-500">
                  {query || brandFilter || categoryFilter
                    ? "No products match your filters."
                    : "No products yet. Add one to get started!"}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3 text-slate-100">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover border border-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700" />
                      )}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{p.brand || "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{p.category || "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-100 font-medium">Rs {Number(p.price).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-slate-100">{p.stock}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-200 hover:bg-slate-700">Edit</button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="px-2 py-1 text-xs rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MOBILE: CARD LIST (below md) ===== */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center p-6 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">⏳ Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-6 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            {query || brandFilter || categoryFilter
              ? "No products match your filters."
              : "No products yet. Add one to get started!"}
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-100 font-medium truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.brand || "—"} {p.category ? `· ${p.category}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-slate-100 font-medium">Rs {Number(p.price).toFixed(2)}</span>
                <span className="text-slate-400">Stock: {p.stock}</span>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 px-3 py-2.5 text-sm rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="flex-1 px-3 py-2.5 text-sm rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;