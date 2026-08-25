"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";

export default function ProductRow({ product }: { product: Product }) {
  const router = useRouter();
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="h-10 w-10 rounded object-cover"
          />
          <span className="font-medium text-ink">{product.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-ink/80">Rs. {product.price.toLocaleString()}</td>
      <td className="px-4 py-3">
        <span
          className={
            totalStock === 0
              ? "text-clay"
              : totalStock <= 5
              ? "text-mustard"
              : "text-ink/80"
          }
        >
          {totalStock} units
        </span>
      </td>
      <td className="px-4 py-3 text-ink/80">
        {product.section}
        {product.subCategory && <span className="text-ink/50"> / {product.subCategory}</span>}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="mr-4 text-sm text-ink hover:text-clay"
        >
          Edit
        </Link>
        <button onClick={handleDelete} className="text-sm text-clay hover:underline">
          Delete
        </button>
      </td>
    </tr>
  );
}
