// apps/storefront/src/App.tsx
import React, { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "./lib/router";
import { UserProvider, useUser } from "./lib/usercontext";
import CartDrawer from "./components/organisms/CartDrawer";
import SupportPanel from "./components/organisms/SupportPanel";
import UserLogin from "./components/UserLogin";

function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const { customer, login, logout, isLoggedIn } = useUser();

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-2">
            Storefront
          </h1>
          <p className="text-gray-600 mb-8">Your favorite online shop</p>
          <UserLogin onLogin={login} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ========================== HEADER ========================== */}
      <header className="border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          {/* Storefront title */}
          <Link
            to="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity"
          >
            Storefront
          </Link>

          {/* ========================== USER + ACTIONS ========================== */}
          <div className="flex items-center gap-3">
            {/* ✅ User Badge (Dynamic + Modern) */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full border border-gray-200 hover:shadow-sm transition-all">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
                {customer?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* Username (Dynamic) */}
              <span className="text-sm font-semibold text-gray-800">
                {customer?.name || "Guest"}
              </span>

              {/* Logout Button */}
              <button
                onClick={logout}
                aria-label="Logout"
                title="Logout"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
              </button>
            </div>

            {/* Orders Button */}
            <Link
              to="/my-orders"
              className="px-4 py-2 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-all transform hover:scale-105 active:scale-95 shadow-sm active:shadow-inner"
            >
              📋 Orders
            </Link>

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
              💬 Support
            </button>
          </div>
        </div>
      </header>

      {/* ========================== MAIN CONTENT ========================== */}
      <main className="flex-1">
        <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
          <AppRoutes />
        </Suspense>
      </main>

      {/* ========================== DRAWERS ========================== */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SupportPanel isOpen={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* ========================== FOOTER ========================== */}
      <footer className="mt-auto text-center text-sm text-gray-500 py-4 border-t">
        © {new Date().getFullYear()} Storefront v1
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
