"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Add something you like from the shop.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-ink px-5 py-3 text-sm font-medium text-cream hover:bg-clay"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Your cart</h1>

      <div className="mt-8 divide-y divide-sand">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-5">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-sand">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="font-medium text-ink">{item.name}</p>
                <p className="text-sm text-ink/60">Size: {item.size}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.productId, item.size, item.qty - 1)}
                    className="h-7 w-7 rounded border border-sand text-ink hover:border-clay"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                    className="h-7 w-7 rounded border border-sand text-ink hover:border-clay"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-ink">
                    Rs. {(item.price * item.qty).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-sm text-clay hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-sand pt-6">
        <span className="text-lg font-medium text-ink">Total</span>
        <span className="text-lg font-medium text-ink">Rs. {total().toLocaleString()}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-md bg-ink px-5 py-3 text-center text-sm font-medium text-cream hover:bg-clay"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
