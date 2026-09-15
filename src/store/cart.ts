"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  key: string; // productId + variant, dùng làm khóa duy nhất trong giỏ
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  variantLabel?: string;
};

type CartState = {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (line, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find((l) => l.key === line.key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === line.key ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        });
      },
      updateQuantity: (key, quantity) => {
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, quantity } : l)),
        }));
      },
      removeItem: (key) => {
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) }));
      },
      clear: () => set({ lines: [] }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
      totalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "bridal-atelier-cart" }
  )
);
