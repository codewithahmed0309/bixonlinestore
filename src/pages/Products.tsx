import React, { useEffect, useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import { categoriesApi, Category } from "../api/CategoryApi"; // 🔥 separate file — adjust path to wherever you save it

type FormState = {
  name: string;
  brand: string;
  category: string;
  original_price: string;
  sale_price: string;
  stock: string;
  unit: string; // 🔥 NEW
  images: File[];
};

const UNIT_OPTIONS = ["pcs", "kg", "g", "ltr", "ml", "box", "pack", "dozen", "set"]; // 🔥 NEW

const emptyForm: FormState = {
  name: "",
  brand: "",
  category: "",
  original_price: "",
  sale_price: "",
  stock: "",
  unit: "pcs", // 🔥 NEW
  images: [],
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

  /* =========================================================
     🔥 CATEGORY MANAGEMENT ADDITIONS — STATE
  ========================================================= */
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDeletingCategoryId, setIsDeletingCategoryId] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  /* =========================================================
     🔥 CATEGORY MANAGEMENT ADDITIONS — API CALLS
  ========================================================= */
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoryError(null);
    try {
      const res = await categoriesApi.list();
      setCategories(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      setCategoryError(err?.message || "Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required.");
      return;
    }
    setIsSavingCategory(true);
    setCategoryError(null);
    try {
      await categoriesApi.create(newCategoryName.trim());
      await fetchCategories();
      setNewCategoryName("");
      setShowCategoryModal(false);
      setSuccessMessage("Category added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to create category:", err);
      setCategoryError(err?.message || "Failed to create category.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Products already using it will keep the name as plain text, but it will disappear from this dropdown.`)) {
      return;
    }
    setIsDeletingCategoryId(id);
    setCategoryError(null);
    try {
      setCategories((prev) => prev.filter((c) => c.id !== id));

      try {
        await categoriesApi.remove(id);
      } catch (err) {
        await fetchCategories(); // rollback sync
      }
      setSuccessMessage("Category deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      setCategoryError(err?.message || "Failed to delete category.");
    } finally {
      setIsDeletingCategoryId(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const mergedCategoryOptions = useMemo(() => {
    const fromApi = categories.map((c) => c.name);
    return [...new Set([...categoryOptions, ...fromApi])].sort();
  }, [categoryOptions, categories]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setSuccessMessage(null);
    setUseCustomCategory(false);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Product name is required.";

    if (
      !form.original_price ||
      isNaN(Number(form.original_price)) ||
      Number(form.original_price) <= 0
    )
      return "Enter a valid original price greater than 0.";

    if (
      !form.sale_price ||
      isNaN(Number(form.sale_price)) ||
      Number(form.sale_price) <= 0
    )
      return "Enter a valid sale price greater than 0.";

    if (Number(form.sale_price) > Number(form.original_price)) {
      return "Sale price cannot be greater than original price.";
    }

    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      return "Enter a valid stock count (0 or more).";

    if (!form.unit.trim()) return "Please select a unit."; // 🔥 NEW

    if (form.images.some((file) => file.size > 3 * 1024 * 1024))
      return "Each image must be under 3MB.";

    return null;
  };

  const buildFormData = (): FormData => {
    const data = new FormData();

    data.append("name", form.name.trim());
    data.append("brand", form.brand.trim() || "");
    data.append("category", form.category.trim() || "");
    data.append("original_price", form.original_price);
    data.append("sale_price", form.sale_price);
    data.append("stock", String(Number(form.stock)));
    data.append("unit", form.unit.trim() || "pcs"); // 🔥 NEW

    // ✅ ONLY SEND IF USER SELECTED NEW IMAGES
    if (form.images.length > 0) {
      form.images.forEach((file) => {
        data.append("images", file);
      });
    }

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
    const originalPrice = String((product as any).original_price ?? "");
    const salePrice = String((product as any).sale_price ?? "");

    setEditingId(product.id);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      original_price: originalPrice,
      sale_price: salePrice,
      stock: String(product.stock ?? ""),
      unit: (product as any).unit || "pcs", // 🔥 NEW
      images: [],
    });
    setShowForm(true);
    setFormError(null);
    setSuccessMessage(null);
    // if the product's category isn't in our known list, fall back to custom input
    setUseCustomCategory(
      !!product.category && !mergedCategoryOptions.includes(product.category)
    );
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

  const displayError = formError || contextError || categoryError;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-100 text-xl font-semibold">Products</h2>
          <p className="text-slate-500 text-sm mt-1">{products.length} total products</p>
        </div>

        {/* ===== Buttons row: original Add Product button + NEW category buttons beside it ===== */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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

          {/* 🔥 NEW: Add Category */}
          <button
            type="button"
            onClick={() => {
              setNewCategoryName("");
              setCategoryError(null);
              setShowCategoryModal(true);
            }}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
          >
            + Add Category
          </button>

          {/* 🔥 NEW: Delete Category */}
          <button
            type="button"
            onClick={() => {
              setCategoryError(null);
              setShowDeleteCategoryModal(true);
            }}
            disabled={isSubmitting || categories.length === 0}
            className="px-4 py-2.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
            title={categories.length === 0 ? "No categories yet" : "Delete a category"}
          >
            Delete Category
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
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
          {mergedCategoryOptions.map((category) => (
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

          {!useCustomCategory ? (
            <select
              value={form.category}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setUseCustomCategory(true);
                  setForm({ ...form, category: "" });
                } else {
                  setForm({ ...form, category: e.target.value });
                }
              }}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-amber-500 focus:outline-none text-sm"
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select Category"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
              <option value="__custom__">+ Type a custom category…</option>
            </select>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setUseCustomCategory(false);
                  setForm({ ...form, category: "" });
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                ← Choose from existing categories instead
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Original Price *"
                value={form.original_price}
                onChange={(e) =>
                  setForm({ ...form, original_price: e.target.value })
                }
                min="0"
                step="0.01"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
              />

              <input
                type="number"
                placeholder="Sale Price *"
                value={form.sale_price}
                onChange={(e) =>
                  setForm({ ...form, sale_price: e.target.value })
                }
                min="0"
                step="0.01"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
              />
            </div>

            {/* 🔥 NEW: Stock + Unit side by side, replacing the lone Stock input */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Stock *"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                min="0"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
              />
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-amber-500 focus:outline-none text-sm"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer text-slate-400 hover:border-amber-500 transition">
            <input
              type="file"
              accept="image/png, image/jpeg"
              multiple
              className="hidden"
              onChange={(e) =>
                setForm({
                  ...form,
                  images: Array.from(e.target.files || []),
                })
              }
            />
            <span className="text-lg">📤</span>
            <span className="mt-1 text-sm font-medium">
              {editingId ? "Add Image (optional)" : "Upload Image"}
            </span>
            {form.images.length > 0 ? (
              <div className="text-xs mt-1 text-green-400">
                ✓ {form.images.length} image(s) selected
              </div>
            ) : (
              <span className="text-xs mt-1">PNG, JPG (max 3MB each)</span>
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

      {/* =========================================================
          🔥 ADD CATEGORY MODAL
      ========================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl w-full max-w-sm space-y-3">
            <h3 className="text-slate-200 font-medium">Add New Category</h3>
            <input
              type="text"
              autoFocus
              placeholder="Category name *"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
            />
            {categoryError && (
              <p className="text-xs text-rose-400">{categoryError}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={createCategory}
                disabled={isSavingCategory}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded font-medium transition disabled:opacity-50 text-sm"
              >
                {isSavingCategory ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setCategoryError(null);
                }}
                disabled={isSavingCategory}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2.5 rounded font-medium transition disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          🔥 DELETE CATEGORY MODAL
      ========================================================= */}
      {showDeleteCategoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl w-full max-w-sm space-y-3">
            <h3 className="text-slate-200 font-medium">Delete Category</h3>

            {categoryError && (
              <p className="text-xs text-rose-400">{categoryError}</p>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categoriesLoading ? (
                <p className="text-sm text-slate-500">⏳ Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-slate-500">No categories left.</p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3 py-2 rounded bg-slate-800 text-slate-100 text-sm"
                  >
                    <span className="truncate">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      disabled={isDeletingCategoryId === cat.id}
                      className="ml-3 px-2 py-1 text-xs rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 shrink-0"
                    >
                      {isDeletingCategoryId === cat.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDeleteCategoryModal(false);
                setCategoryError(null);
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2.5 rounded font-medium transition text-sm"
            >
              Close
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
                      {p.images && p.images.length > 0 ? (
                        <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover border border-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700" />
                      )}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{p.brand || "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{p.category || "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-100 font-medium">
                    <div className="text-right text-slate-100 font-medium">
                      {typeof (p as any).original_price !== "undefined" && (p as any).original_price !== null && (
                        <div className="text-xs text-slate-500 line-through">
                          Rs {Number((p as any).original_price).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* 🔥 UPDATED: show unit next to stock count */}
                  <td className="px-5 py-3 text-right text-slate-100">
                    {p.stock} {(p as any).unit ? <span className="text-slate-500">{(p as any).unit}</span> : null}
                  </td>
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
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-100 font-medium truncate">{p.name}</p>
                  {/* 🔥 UPDATED: show unit alongside brand/category */}
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.brand || "—"} {p.category ? `· ${p.category}` : ""} {(p as any).unit ? `· per ${(p as any).unit}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-100 font-medium">
                  Rs {Number(p.sale_price ?? 0).toFixed(2)}
                </span>

                {p.original_price && p.original_price > p.sale_price && (
                  <span className="text-xs text-slate-400 line-through">
                    Rs {Number(p.original_price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* 🔥 NEW: stock + unit line on mobile cards */}
              <p className="text-xs text-slate-500 mt-1">
                {p.stock} {(p as any).unit || ""} in stock
              </p>

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
