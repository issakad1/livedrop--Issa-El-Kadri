import React, { lazy } from "react";
import { useRoutes } from "react-router-dom";

const Catalog = lazy(() => import("../pages/catalog"));
const Product = lazy(() => import("../pages/product"));
const Cart = lazy(() => import("../pages/cart"));
const Checkout = lazy(() => import("../pages/checkout"));
const OrderStatus = lazy(() => import("../pages/order-status"));

export function AppRoutes() {
  return useRoutes([
    { path: "/", element: <Catalog /> },
    { path: "/p/:id", element: <Product /> },
    { path: "/cart", element: <Cart /> },
    { path: "/checkout", element: <Checkout /> },
    { path: "/order/:id", element: <OrderStatus /> }
  ]);
}
