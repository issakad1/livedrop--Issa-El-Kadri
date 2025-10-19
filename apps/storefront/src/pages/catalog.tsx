import React, { useEffect, useMemo, useState } from "react";
import { listProducts } from "../lib/api";
import ProductCard from "../components/molecules/ProductCard";
import { useCart } from "../lib/store";

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  tags: string[];
  stockQty: number;
  description?: string;
};

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("");
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "">("");
  const add = useCart((s) => s.add);

  // ✅ Fetch and normalize backend data
  useEffect(() => {
    listProducts()
      .then((data) => {
        const normalized = data.map((p: any) => ({
          id: p._id,
          title: p.name,
          price: p.price,
          image: p.imageUrl,
          tags: p.tags || [],
          stockQty: p.stock || 0,
          description: p.description || "",
        }));
        setProducts(normalized);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
      });
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let res = products;

    if (query) {
      res = res.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(query);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(query));
        return inTitle || inTags;
      });
    }

    if (tag) res = res.filter((p) => p.tags.includes(tag));
    if (sort === "price-asc") res = [...res].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") res = [...res].sort((a, b) => b.price - a.price);

    return res;
  }, [products, q, tag, sort]);

  const allTags = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.tags))),
    [products]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 🔍 Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              className="flex-1 min-w-[250px] border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700
                       placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1
                       focus:ring-blue-500 transition-colors"
              placeholder="Search title or tag..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search"
            />

            <select
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                       transition-colors cursor-pointer bg-white min-w-[120px]"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              aria-label="Sort"
            >
              <option value="">Sort</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                       transition-colors cursor-pointer bg-white min-w-[140px]"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              aria-label="Tag filter"
            >
              <option value="">All tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <span
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm"
              aria-live="polite"
            >
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* 🛍️ Products Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <h3 className="text-xl text-gray-700 font-semibold mb-2">
              No products found
            </h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                image={p.image}
                description={p.description}
                onAdd={() =>
                  add({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    image: p.image,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
