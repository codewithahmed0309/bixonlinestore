import { useEffect, useState } from "react";

export default function LoaderScreen() {
  const messages = [
    "Getting your store ready...",
    "Loading fresh products for you...",
    "Preparing your shopping experience...",
    "Almost ready, thanks for your patience..."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      
      {/* Spinner */}
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 h-20 w-20 rounded-full bg-yellow-500 opacity-20 animate-ping"></div>
      </div>

      {/* Brand */}
      <h1 className="text-3xl font-bold tracking-wide text-yellow-600">
        RAHI STORE
      </h1>

      {/* Friendly message */}
      <p className="mt-4 text-center text-gray-700 text-lg font-medium transition-all duration-500">
        {messages[index]}
      </p>

      {/* Soft reassurance */}
      <p className="mt-2 text-sm text-gray-400 text-center max-w-sm">
        We’re setting up everything for a smooth shopping experience.
      </p>

      {/* Progress feel */}
      <div className="mt-6 h-1 w-48 overflow-hidden rounded bg-gray-200">
        <div className="h-full w-1/2 bg-yellow-500 animate-pulse"></div>
      </div>
    </div>
  );
}
