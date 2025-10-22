// ================================
// apps/storefront/src/pages/my-orders.tsx
// ================================
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../lib/usercontext";
import { formatCurrency } from "../lib/format";

type Order = {
  _id: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: string;
  carrier?: string;
  estimatedDelivery?: string;
  createdAt: string;
};

export default function MyOrdersPage() {
  const { customer } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;

    const apiUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "https://livedrop-issa-el-kadri-production.up.railway.app";

    fetch(`${apiUrl}/api/orders?customerId=${customer._id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [customer]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Hi {customer?.name}! Here are all your orders.
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl text-gray-700 font-semibold mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here!
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusColors = {
                PENDING: "bg-gray-100 text-gray-700 border-gray-300",
                PROCESSING: "bg-yellow-100 text-yellow-700 border-yellow-300",
                SHIPPED: "bg-blue-100 text-blue-700 border-blue-300",
                DELIVERED: "bg-green-100 text-green-700 border-green-300",
              };

              const statusColor =
                statusColors[order.status as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-700 border-gray-300";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${statusColor}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {item.name} × {item.quantity} -{" "}
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        ))}
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div>
                          📅{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                        {order.carrier && <div>🚚 {order.carrier}</div>}
                        {order.estimatedDelivery && (
                          <div>
                            ⏰{" "}
                            {new Date(order.estimatedDelivery).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Total & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(order.total)}
                        </div>
                      </div>

                      <Link
                        to={`/order/${order._id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
                      >
                        Track Order →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}