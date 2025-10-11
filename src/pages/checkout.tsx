import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../lib/store";
import { placeOrder } from "../lib/api";
import { formatCurrency } from "../lib/format";

export default function CheckoutPage() {
  const { lines, total, clear } = useCart();
  const nav = useNavigate();

  async function onPlace() {
    const cart = lines.map((l) => ({ id: l.id, qty: l.qty }));
    const { orderId } = await placeOrder(cart);
    clear();
    nav(`/order/${orderId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-500">
            Review your order before placing it
          </p>
        </div>

        {lines.length === 0 ? (
          <>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 text-center transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              <p className="text-2xl mb-2">🛒</p>
              <p className="text-gray-700 font-semibold text-lg">
                Your cart is empty
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Add some items before checking out
              </p>
            </div>

            <button
              onClick={() => nav("/")}
              className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold text-lg text-center
                         hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-95 
                         transition-all duration-200 ease-out shadow-lg hover:shadow-xl"
            >
              ← Continue Shopping
            </button>
          </>
        ) : (
          <>
            {/* Order Summary */}
            <div className="space-y-3 mb-8">
              {lines.map((l) => (
                <div
                  key={l.id}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-purple-300 flex justify-between items-center"
                >
                  <span className="text-gray-700 font-medium">
                    {l.title} × {l.qty}
                  </span>
                  <span className="text-purple-600 font-semibold text-lg">
                    {formatCurrency(l.qty * l.price)}
                  </span>
                </div>
              ))}

              {/* Total Box */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300 flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-lg">
                  Total
                </span>
                <span className="text-blue-600 font-bold text-xl">
                  {formatCurrency(total())}
                </span>
              </div>
            </div>

            {/* Place Order */}
            <button
              onClick={onPlace}
              className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-semibold text-lg text-center
                         hover:from-green-600 hover:to-emerald-600 hover:scale-[1.02] active:scale-95 
                         transition-all duration-200 ease-out shadow-lg hover:shadow-xl"
            >
              Place Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}
