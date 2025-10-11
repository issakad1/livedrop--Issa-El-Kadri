import React, { useEffect, useRef } from "react";
import { useCart } from "../../lib/store";
import { formatCurrency } from "../../lib/format";
import { Link } from "react-router-dom";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { lines, inc, dec, remove, total } = useCart();

  useEffect(() => {
    if (open) {
      const prev = document.activeElement as HTMLElement | null;
      ref.current?.focus();
      return () => prev?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cart"
      className="fixed inset-0 z-40"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 w-96 max-w-full h-full bg-white p-5 overflow-auto outline-none shadow-2xl animate-slide-in border-l border-gray-200"
        tabIndex={-1}
        ref={ref}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
             Cart
          </h2>
          <button
            aria-label="Close cart"
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-transform transform hover:scale-110 active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <ul className="flex flex-col gap-4">
          {lines.map((l) => (
            <li
              key={l.id}
              className="flex gap-3 items-start bg-gray-50 hover:bg-gray-100 border border-gray-200 
                         rounded-lg p-3 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <img
                src={l.image ?? "/logo.svg"}
                alt=""
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800 leading-tight">
                  {l.title}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {formatCurrency(l.price)} × {l.qty}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => dec(l.id)}
                    className="border rounded-md px-3 py-1 text-sm font-medium text-gray-700 
                               transition-all duration-200 hover:bg-blue-100 active:scale-95 shadow-sm"
                    aria-label={`Decrease ${l.title}`}
                  >
                    -
                  </button>

                  <button
                    onClick={() => inc(l.id)}
                    className="border rounded-md px-3 py-1 text-sm font-medium text-gray-700 
                               transition-all duration-200 hover:bg-blue-100 active:scale-95 shadow-sm"
                    aria-label={`Increase ${l.title}`}
                  >
                    +
                  </button>

                  <button
                    onClick={() => remove(l.id)}
                    className="border border-red-500 text-red-500 rounded-md px-3 py-1 text-sm font-medium
                               transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95 shadow-sm"
                    aria-label={`Remove ${l.title}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}

          {lines.length === 0 && (
  <div className="flex flex-col items-center justify-center text-center text-gray-500 py-14">
    <div className="text-5xl mb-3 opacity-70">🛍️</div>
    <p className="text-gray-700 font-medium text-lg mb-1">Your cart is empty</p>
    <p className="text-gray-400 text-sm mb-6">Add something you love to get started!</p>

    <Link
      to="/"
      onClick={onClose}
      className="px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium 
                 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.03] active:scale-95 
                 shadow-sm hover:shadow-md"
    >
      Back to Catalog
    </Link>
  </div>
)}

        </ul>

        {/* Footer */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-semibold text-gray-800 mb-4">
            <span>Total</span>
            <span>{formatCurrency(total())}</span>
          </div>

          <Link
            to="/checkout"
            className={`block w-full text-center px-4 py-3 rounded-md font-semibold text-white 
                        transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg 
                        ${
                          lines.length > 0
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
            onClick={lines.length > 0 ? onClose : undefined}
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
