import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../customer/context/CartContext";
import ProtectedRoute from "../components/ProtectedRoutes";

import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";

import CustomerLayout from "../customer/layouts/CustomerLayout";
import Home from "../customer/pages/Home";
import CustomerProducts from "../customer/pages/Products";
import ProductDetails from "../customer/pages/ProductDetails";
import Cart from "../customer/pages/Cart";

/* ---------------- 404 PAGE ---------------- */
const NotFound = () => (
  <div className="flex h-screen items-center justify-center text-slate-700">
    404 - Page Not Found
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* ---------------- CUSTOMER STOREFRONT ---------------- */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              {/* <Route path="/categories" element={<Categories />} /> */}
              <Route path="/products" element={<CustomerProducts />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
            </Route>

            {/* ---------------- ADMIN LOGIN ---------------- */}
            <Route path="/admin/login" element={<Login />} />

            {/* redirect /admin → login */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* ---------------- PROTECTED ADMIN AREA ---------------- */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
              </Route>
            </Route>

            {/* ---------------- 404 ---------------- */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default AppRouter;
