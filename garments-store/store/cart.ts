"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = [...get().items];
        const existing = items.find(
          (i) => i.productId === item.productId && i.size === item.size
        );
        if (existing) {
          existing.qty += item.qty;
        } else {
          items.push(item);
        }
        set({ items });
      },
      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size)
          )
        });
      },
      updateQty: (productId, size, qty) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, qty: Math.max(1, qty) }
              : i
          )
        });
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0)
    }),
    { name: "garments-cart" }
  )
);
