import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { STORE_NAME } from "../config/store";
import ResellerApplicationModal from "../components/reseller/ResellerApplicationModal";

const CustomerLayout: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">

          <p className="font-semibold text-slate-700">{STORE_NAME}</p>

          <p className="mt-1">
            Browse products and order instantly over WhatsApp — no account needed.
          </p>

          {/* BUSINESS INFO */}
          <div className="mt-4 text-slate-600">
            <p>Jamiya Shahida Lilbanat</p>
            <p>Rajewadi, Maharashtra, 402309</p>
          </div>

          {/* CONTACT */}
          <a
            href="https://wa.me/917276626991"
            className="text-yellow-600 font-medium block mt-3"
            target="_blank"
            rel="noreferrer"
          >
            +91 72766 26991 (WhatsApp)
          </a>

          {/* RESELLER BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Become a Reseller
          </button>

          <p className="mt-6 text-xs text-slate-400">
            © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* MODAL HERE */}
      <ResellerApplicationModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

export default CustomerLayout;
