"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center text-ink/60">
        Your cart is empty. Add a product before checking out.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customer: form,
        paymentMethod: "cod"
      })
    });

    setLoading(false);
    if (!res.ok) {
      alert("Something went wrong placing your order. Please try again.");
      return;
    }

    const order = await res.json();

    clear();
    router.push(`/checkout/success?orderId=${order.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Phone (WhatsApp)</label>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="03xxxxxxxxx"
            className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Delivery address</label>
          <textarea
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">City</label>
          <input
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Payment method</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-md border border-sand bg-white px-4 py-3">
              <span className="h-4 w-4 rounded-full border-4 border-clay" />
              <span>Cash on Delivery</span>
            </div>
            <p className="text-xs text-ink/50">Online payment will be added later.</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-sand pt-5">
          <span className="text-lg font-medium text-ink">Total</span>
          <span className="text-lg font-medium text-ink">Rs. {total().toLocaleString()}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-cream hover:bg-clay disabled:opacity-50"
        >
          {loading ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
