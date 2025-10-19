import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct, listProducts } from "../lib/api";
import { useCart } from "../lib/store";
import { formatCurrency } from "../lib/format";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  useEffect(() => {
    if (!id) return;

    getProduct(id).then((p) => {
      if (!p) return;
      setProduct(p);

      listProducts().then((all) => {
        const rel = all
          .filter(
            (x: any) =>
              x._id !== p._id &&
              x.tags?.some((t: string) => p.tags?.includes(t))
          )
          .slice(0, 3);
        setRelated(rel);
      });
    });
  }, [id]);

  if (!product)
    return <div className="p-6 text-gray-600">Loading product details...</div>;

  const handleAdd = () => {
    add({
      id: product._id, // ✅ backend ID
      title: product.name, // ✅ backend field
      price: product.price,
      image: product.imageUrl, // ✅ backend image field
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8 relative">
        {/* Floating "Added to Cart" badge */}
        {added && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-md animate-bounce">
            ✔ Added to Cart
          </div>
        )}

        {/* Product Image */}
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          className="w-full md:w-1/2 rounded-lg shadow-md object-cover"
        />

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-800 mb-3 text-left tracking-tight">
            {product.name}
          </h1>

          {product.description && (
            <p
              className="text-gray-700 mb-4 text-left leading-relaxed"
              style={{
                fontSize: "1.05rem",
                lineHeight: "1.9",
                fontFamily: "'Georgia', 'serif'",
                letterSpacing: "0.01em",
                color: "#3a3a3a",
              }}
            >
              {product.description}
            </p>
          )}

          <div className="text-xl font-semibold text-blue-600 mb-4 text-left">
            {formatCurrency(product.price)}
          </div>

          <button
            onClick={handleAdd}
            disabled={(product.stock ?? 0) <= 0}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-300 transform ${
              (product.stock ?? 0) > 0
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="mt-12 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2
            className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2"
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            <span className="text-blue-600">★</span>
            You may also like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {related.map((r: any) => (
              <Link
                key={r._id}
                to={`/p/${r._id}`}
                className="block border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <img
                  src={r.imageUrl || "/placeholder.png"}
                  alt={r.name}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
                <div className="font-medium text-gray-800">{r.name}</div>
                <div className="text-blue-600 font-semibold">
                  {formatCurrency(r.price)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to Catalog */}
      <div className="mt-10 text-right">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg
               hover:from-indigo-500 hover:to-blue-500 hover:scale-105 active:scale-95
               transition-all duration-300 ease-out"
        >
          <span className="font-medium tracking-wide">Back to Catalog</span>
          <span className="text-xl">→</span>
        </Link>
      </div>
    </div>
  );
}
