"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";

export default function Navbar() {
  const items = useCart((s) => s.items);
  const [count, setCount] = useState(0);

  // Avoid hydration mismatch: localStorage-backed count only after mount.
  useEffect(() => {
    setCount(items.reduce((sum, i) => sum + i.qty, 0));
  }, [items]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
          Ashraf Garments
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink/80">
          <Link href="/" className="hover:text-clay">
            Shop
          </Link>
          <Link href="/cart" className="relative hover:text-clay">
            Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] text-cream">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
