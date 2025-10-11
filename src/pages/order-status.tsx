import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderStatus } from "../lib/api";

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    getOrderStatus(id).then((data) => {
      // 🕒 Always generate a future ETA (2–7 days ahead)
      const etaDate = new Date();
      const addDays = 2 + Math.floor(Math.random() * 6); // between 2–7 days
      etaDate.setDate(etaDate.getDate() + addDays);

      const formattedETA = etaDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Attach guaranteed future ETA
      data.eta = formattedETA;
      setOrder(data);
    });
  }, [id]);

  if (!id)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Invalid order ID.</p>
      </div>
    );

  if (!order)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Loading your order details...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-xl">
        {/* Header with Order ID */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Order #{id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-gray-500">Your order has been successfully placed</p>
        </div>

        {/* Order Details in Colored Boxes */}
        <div className="space-y-3 mb-8">
          {/* Status Box */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-green-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">📦 Status</span>
              <span className="text-green-600 font-bold text-lg">{order.status}</span>
            </div>
          </div>

          {/* Carrier Box */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">🚚 Carrier</span>
              <span className="text-blue-600 font-bold text-lg">{order.carrier || "TBA"}</span>
            </div>
          </div>

          {/* ETA Box */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-purple-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">⏰ Estimated Delivery</span>
              <span className="text-purple-600 font-bold text-lg">{order.eta}</span>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-gray-700 font-semibold text-lg">Thank you for your order!</p>
          <p className="text-gray-500 text-sm mt-1">
            We'll send you updates as your order ships
          </p>
        </div>

        {/* Continue Shopping Button */}
        <Link
          to="/"
          className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold text-lg text-center
                     hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-95 
                     transition-all duration-200 ease-out shadow-lg hover:shadow-xl"
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
