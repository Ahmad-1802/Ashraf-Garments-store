import Link from "next/link";
import { getProducts } from "@/lib/db";
import ProductRow from "@/components/admin/ProductRow";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-clay"
        >
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-ink/60">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-sand">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/60 text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand bg-white/30">
              {products.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
