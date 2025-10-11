import React, { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "./lib/router";
import CartDrawer from "./components/organisms/CartDrawer";
import SupportPanel from "./components/organisms/SupportPanel";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          {/* Storefront title on the left — styled like the page title */}
          <Link
            to="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity"
          >
            Storefront
          </Link>

          {/* Cart and Support buttons on the right */}
          <nav className="flex gap-3">
            {/* Cart Button */}
            <button
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all transform hover:scale-105 active:scale-95 shadow-sm active:shadow-inner"
            >
              🛒 Cart
            </button>

            {/* Support Button */}
            <button
              aria-label="Ask support"
              onClick={() => setSupportOpen(true)}
              className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95 shadow-sm active:shadow-inner"
            >
              💬 Ask Support
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
          <AppRoutes />
        </Suspense>
      </main>

      {/* Drawers */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SupportPanel open={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* Footer */}
      <footer className="mt-auto text-center text-sm text-gray-500 py-4 border-t">
        © {new Date().getFullYear()} Storefront v1
      </footer>
    </div>
  );
}
