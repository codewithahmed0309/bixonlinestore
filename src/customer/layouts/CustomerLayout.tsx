import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { STORE_NAME } from "../config/store";

const CustomerLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-700">{STORE_NAME}</p>
          <p className="mt-1">
            Browse products and order instantly over WhatsApp — no account needed.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
