// apps/storefront/src/lib/api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://livedrop-issa-el-kadri-production.up.railway.app";

// Product type matches your backend data
export type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/products?limit=50`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.items || data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function fetchCustomerByEmail(email: string) {
  const res = await fetch(`${API_BASE_URL}/api/customers?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Customer not found");
  return res.json();
}
export async function getOrderStatus(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
  if (!res.ok) throw new Error("Failed to fetch order status");
  return res.json();
}

