// ================================
// apps/storefront/src/pages/order-status.tsx - UPDATED
// ================================
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatCurrency } from "../lib/format";
import { getOrderStatus } from "../lib/api";

export default function OrderStatusPage() {
  const { id } = useParams();
  const [status, setStatus] = useState<string>("LOADING...");
  const [carrier, setCarrier] = useState<string>("TBA");
  const [eta, setEta] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Step 1: Fetch initial order details
    getOrderStatus(id)
      .then((data) => {
        setStatus(data.status || "PENDING");
        setCarrier(data.carrier || "TBA");
        // Format ETA date nicely
        if (data.estimatedDelivery) {
          const date = new Date(data.estimatedDelivery);
          setEta(date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }));
        }
      })
      .catch(() => setError("Failed to fetch order details."));

    // Step 2: Connect to SSE stream for live updates
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 
                   "https://livedrop-issa-el-kadri-production.up.railway.app";
    
    const source = new EventSource(`${apiUrl}/api/orders/${id}/stream`);

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Received update:', data);
        
        // Update status
        if (data.status) {
          setStatus(data.status);
        }
        
        // Update carrier
        if (data.carrier) {
          setCarrier(data.carrier);
        }
        
        // Update ETA
        if (data.estimatedDelivery) {
          const date = new Date(data.estimatedDelivery);
          setEta(date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }));
        }
        
        // Update message
        if (data.message) {
          setMessage(data.message);
        }
        
        // Close stream when delivered
        if (data.status === "DELIVERED") {
          console.log('[SSE] Order delivered, closing stream');
          setTimeout(() => source.close(), 2000); // Keep open for 2 more seconds
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    source.onerror = (err) => {
      console.error("SSE connection error:", err);
      source.close();
    };

    source.onopen = () => {
      console.log('[SSE] Connection opened');
    };

    // Cleanup on unmount
    return () => {
      console.log('[SSE] Cleaning up connection');
      source.close();
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-xl mb-4">{error}</p>
          <Link
            to="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Invalid order ID.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Order #{id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-gray-500">Tracking your order in real-time</p>
          {/* Live indicator */}
          {status !== "DELIVERED" && status !== "LOADING..." && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-green-700 font-medium">Live Updates</span>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="mb-8">
          <div className="flex justify-between relative">
            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s, idx) => {
              const isActive = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(status) >= idx;
              const isCurrent = status === s;
              
              return (
                <div key={s} className="flex-1 relative">
                  {idx > 0 && (
                    <div className={`absolute top-4 left-0 right-0 h-1 -z-10 ${
                      isActive ? 'bg-blue-500' : 'bg-gray-200'
                    }`} style={{ width: '100%', left: '-50%' }} />
                  )}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-blue-200 scale-110' : ''} transition-all duration-300`}>
                      {isActive ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {s}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Status Section */}
        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-xl p-4 transition-all duration-300 ${
              status === "DELIVERED"
                ? "bg-green-50 border-green-300"
                : status === "SHIPPED"
                ? "bg-blue-50 border-blue-300"
                : status === "PROCESSING"
                ? "bg-yellow-50 border-yellow-300"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">📦 Status</span>
              <span
                className={`font-bold text-lg ${
                  status === "DELIVERED"
                    ? "text-green-600"
                    : status === "SHIPPED"
                    ? "text-blue-600"
                    : status === "PROCESSING"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Carrier */}
          {carrier && carrier !== "TBA" && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">🚚 Carrier</span>
                <span className="text-blue-600 font-semibold">{carrier}</span>
              </div>
            </div>
          )}

          {/* ETA */}
          {eta && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">⏰ Estimated Delivery</span>
                <span className="text-purple-600 font-semibold">{eta}</span>
              </div>
            </div>
          )}
        </div>

        {/* Thank You Section */}
        {status === "DELIVERED" && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center mb-6 animate-bounce">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-gray-700 font-semibold text-lg">
              Your order has been delivered!
            </p>
            <p className="text-gray-500 text-sm mt-1">
              We hope you enjoy your purchase.
            </p>
          </div>
        )}

        {/* Back to Catalog Button */}
        <Link
          to="/"
          className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold text-lg text-center
                     hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-95 
                     transition-all duration-200 ease-out shadow-lg hover:shadow-xl"
        >
          ← Back to Catalog
        </Link>
      </div>
    </div>
  );
}