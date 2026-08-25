import Link from "next/link";
import { getProducts, getOrders } from "@/lib/db";

export default async function AdminDashboard() {
  const [products, orders] = await Promise.all([getProducts(), getOrders()]);

  const lowStock = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= 3)
  );
  const outOfStock = products.filter((p) => p.variants.every((v) => v.stock === 0));
  const pendingOrders = orders.filter((o) => o.orderStatus === "pending");

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products" },
    { label: "Orders", value: orders.length, href: "/admin/orders" },
    { label: "Pending orders", value: pendingOrders.length, href: "/admin/orders" },
    { label: "Low / out of stock", value: lowStock.length + outOfStock.length, href: "/admin/products" }
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-sand bg-white/60 p-4 transition hover:border-clay"
          >
            <p className="text-2xl font-medium text-ink">{s.value}</p>
            <p className="text-sm text-ink/60">{s.label}</p>
          </Link>
        ))}
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="mt-8">
          <h2 className="mb-3 font-medium text-ink">Stock alerts</h2>
          <div className="space-y-2">
            {outOfStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border border-clay/30 bg-clay/5 px-4 py-2 text-sm">
                <span>{p.name}</span>
                <span className="text-clay">Out of stock</span>
              </div>
            ))}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border border-mustard/40 bg-mustard/5 px-4 py-2 text-sm">
                <span>{p.name}</span>
                <span className="text-mustard">Running low</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
