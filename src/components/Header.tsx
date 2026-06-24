import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { admin } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30 shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="md:hidden p-2.5 -ml-1 rounded-lg text-slate-300 hover:bg-slate-800 active:bg-slate-700"
      >
        <span className="text-xl">☰</span>
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300">
          {(admin?.email || "A").charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm text-slate-300">{admin?.email}</span>
      </div>
    </header>
  );
};

export default Header;