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

// ✅ ADD THIS FUNCTION:
export async function placeOrder(cart: Array<{ id: string; qty: number }>) {
  // Get logged-in customer from localStorage
  const customerStr = localStorage.getItem("customer");
  if (!customerStr) {
    throw new Error("Please log in to place an order");
  }
  
  const customer = JSON.parse(customerStr);
  
  // Fetch product details for each cart item
  const itemsWithDetails = await Promise.all(
    cart.map(async (item) => {
      const product = await getProduct(item.id);
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.qty
      };
    })
  );
  
  // Calculate total
  const total = itemsWithDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // Create order
  const orderData = {
    customerId: customer._id,
    items: itemsWithDetails,
    total
  };
  
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to place order");
  }
  
  const order = await res.json();
  return { orderId: order._id };
}