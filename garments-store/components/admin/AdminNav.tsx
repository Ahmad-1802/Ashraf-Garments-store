"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" }
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-full shrink-0 border-b border-sand bg-indigo px-5 py-4 text-cream sm:min-h-screen sm:w-56 sm:border-b-0 sm:border-r sm:py-8">
      <p className="mb-6 font-display text-lg font-semibold tracking-tight">Shop Admin</p>
      <nav className="flex gap-4 sm:flex-col sm:gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition ${
                active ? "bg-cream/10 font-medium" : "text-cream/70 hover:bg-cream/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="mt-4 rounded-md px-3 py-2 text-left text-sm text-cream/70 hover:bg-cream/5"
        >
          Log out
        </button>
      </nav>
    </aside>
  );
}
