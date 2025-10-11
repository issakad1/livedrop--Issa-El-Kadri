import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/format";

export default function ProductCard({ id, title, price, image, onAdd }: any) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500); // Hide after 1.5s
  };

  return (
    <div className="relative border rounded-lg p-4 bg-white shadow-sm">
      {/* Added Badge */}
      {added && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
          ✔ Added to Cart
        </div>
      )}

      <Link to={`/p/${id}`}>
        <img
          src={image ?? "/logo.svg"}
          alt={title}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
        <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
        <p className="text-gray-700 font-medium mt-1">{formatCurrency(price)}</p>
        <p className="text-blue-600 text-sm mt-1 underline">View details →</p>
      </Link>

      <button
        onClick={handleAdd}
        className="mt-3 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-150"
      >
        Add to Cart
      </button>
    </div>
  );
}
