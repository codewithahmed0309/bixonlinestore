import React, { Suspense } from "react";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
          Loading...
        </div>
      }
    >
      <AppRouter />
    </Suspense>
  );
}