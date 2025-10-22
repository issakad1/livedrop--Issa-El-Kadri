// ================================
// apps/storefront/src/lib/router.tsx
// Router (lazy loaded) - Updated for Part 5 Dashboard
// ================================

import React, { lazy } from "react";
import { useRoutes, Navigate } from "react-router-dom";

// Lazy imports for pages
const Catalog = lazy(() => import("../pages/catalog"));
const Product = lazy(() => import("../pages/product"));
const Cart = lazy(() => import("../pages/cart"));
const Checkout = lazy(() => import("../pages/checkout"));
const OrderStatus = lazy(() => import("../pages/order-status"));
const MyOrders = lazy(() => import("../pages/my-orders"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard")); // ✅ Added for Part 5

export function AppRoutes() {
  return useRoutes([
    { path: "/", element: <Catalog /> },
    { path: "/p/:id", element: <Product /> },
    { path: "/cart", element: <Cart /> },
    { path: "/checkout", element: <Checkout /> },
    { path: "/order/:id", element: <OrderStatus /> },
    { path: "/my-orders", element: <MyOrders /> },

    // ✅ Admin Dashboard Route (Part 5)
    { path: "/admin", element: <AdminDashboard /> },

    // Optional: redirect /dashboard → /admin
    { path: "/dashboard", element: <Navigate to="/admin" replace /> },

    // ✅ Optional Fallback
    {
      path: "*",
      element: (
        <div className="p-10 text-center text-gray-500 text-lg">
          Page not found.
        </div>
      ),
    },
  ]);
}
