"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { useCart } from "@/store/cart";

export default function AddToCartForm({ product }: { product: Product }) {
  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const [size, setSize] = useState(inStockVariants[0]?.size ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const router = useRouter();

  const selectedVariant = product.variants.find((v) => v.size === size);
  const maxQty = selectedVariant?.stock ?? 0;

  if (inStockVariants.length === 0) {
    return (
      <div className="mt-6 rounded-md bg-ink/5 px-4 py-3 text-sm text-ink/70">
        This item is currently out of stock. Check back soon.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Size</p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.size}
              disabled={v.stock === 0}
              onClick={() => {
                setSize(v.size);
                setQty(1);
              }}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                v.stock === 0
                  ? "cursor-not-allowed border-sand text-ink/30 line-through"
                  : v.size === size
                  ? "border-clay bg-clay text-cream"
                  : "border-sand text-ink hover:border-clay"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-8 w-8 rounded-md border border-sand text-ink hover:border-clay"
          >
            −
          </button>
          <span className="w-6 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="h-8 w-8 rounded-md border border-sand text-ink hover:border-clay"
          >
            +
          </button>
          <span className="text-xs text-ink/50">{maxQty} left in this size</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => {
            addItem({
              productId: product.id,
              name: product.name,
              size,
              price: product.price,
              qty,
              image: product.image
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-clay"
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          onClick={() => {
            addItem({
              productId: product.id,
              name: product.name,
              size,
              price: product.price,
              qty,
              image: product.image
            });
            router.push("/cart");
          }}
          className="rounded-md border border-ink px-5 py-3 text-sm font-medium text-ink transition hover:border-clay hover:text-clay"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
