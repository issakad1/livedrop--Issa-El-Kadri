import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartLine = { id: string; title: string; price: number; qty: number; image?: string };
type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine,"qty">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(persist((set, get) => ({
  lines: [],
  add: (line) => {
    const existing = get().lines.find(l => l.id === line.id);
    set({ lines: existing
      ? get().lines.map(l => l.id === line.id ? { ...l, qty: l.qty + 1 } : l)
      : [...get().lines, { ...line, qty: 1 }]
    });
  },
  inc: (id) => set({ lines: get().lines.map(l => l.id === id ? { ...l, qty: l.qty + 1 } : l) }),
  dec: (id) => set({ lines: get().lines.flatMap(l => l.id === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l]) }),
  remove: (id) => set({ lines: get().lines.filter(l => l.id !== id) }),
  clear: () => set({ lines: [] }),
  total: () => get().lines.reduce((sum, l) => sum + l.price * l.qty, 0),
}), { name: "storefront-cart" }));
