import React from "react";
import { useCart } from "../lib/store";
import { formatCurrency } from "../lib/format";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { lines, inc, dec, remove, total } = useCart();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Cart</h1>
      {lines.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          <ul className="flex flex-col gap-4">
            {lines.map(l => (
              <li key={l.id} className="flex items-center gap-3 border-b pb-3">
                <img src={l.image ?? "/logo.svg"} alt="" className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{l.title}</div>
                  <div className="text-sm">{formatCurrency(l.price)} × {l.qty}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => dec(l.id)}>-</button>
                  <button onClick={() => inc(l.id)}>+</button>
                  <button onClick={() => remove(l.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between">
            <span>Total</span>
            <span className="font-medium">{formatCurrency(total())}</span>
          </div>
          <Link to="/checkout" className="mt-4 inline-block underline">Checkout</Link>
        </>
      )}
    </div>
  );
}
