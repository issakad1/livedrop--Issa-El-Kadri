type Product = { id: string; title: string; price: number; image: string; tags: string[]; stockQty: number };
const delay = (ms=150) => new Promise(res => setTimeout(res, ms));

let orderDB: Record<string, { status: "Placed"|"Packed"|"Shipped"|"Delivered"; carrier?: string; eta?: string }> = {};

export async function listProducts(): Promise<Product[]> {
  const res = await fetch("/mock-catalog.json");
  return res.json();
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const all = await listProducts();
  return all.find(p => p.id === id);
}

export async function placeOrder(cart: { id: string; qty: number }[]) {
  const id = Array.from({length: 12}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*36)]).join("");
  orderDB[id] = { status: "Placed" };
  await delay();
  return { orderId: id };
}

export async function getOrderStatus(
  id: string
): Promise<{
  id?: string;
  status: "Placed" | "Packed" | "Shipped" | "Delivered";
  carrier?: string;
  eta?: string;
}> {
  const statuses = ["Placed", "Packed", "Shipped", "Delivered"] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  if (status === "Shipped" || status === "Delivered") {
    return {
      id,
      status,
      carrier: "UPS",
      eta: "2025-10-12"
    };
  }

  return { id, status }
}
