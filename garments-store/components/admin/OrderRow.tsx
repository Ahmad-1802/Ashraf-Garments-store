"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
];

const statusColor: Record<OrderStatus, string> = {
  pending: "bg-mustard/15 text-mustard",
  processing: "bg-indigo/10 text-indigo",
  shipped: "bg-indigo/10 text-indigo",
  delivered: "bg-moss/15 text-moss",
  cancelled: "bg-clay/15 text-clay"
};

export default function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.orderStatus);
  const [tracking, setTracking] = useState(order.courierTrackingId ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: status, courierTrackingId: tracking || undefined })
    });
    setSaving(false);
    router.refresh();
  }



  return (
    <div className="rounded-lg border border-sand bg-white/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="font-medium text-ink">{order.customer.name}</p>
          <p className="text-xs text-ink/50">
            {new Date(order.createdAt).toLocaleString()} &middot; Rs. {order.total.toLocaleString()}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor[order.orderStatus]}`}>
          {order.orderStatus}
        </span>
      </button>

      {open && (
        <div className="border-t border-sand px-4 py-4 text-sm">
          <p className="text-ink/70">
            {order.customer.phone} &middot; {order.customer.address}, {order.customer.city}
          </p>
          <p className="mt-1 text-ink/50">
            Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
          </p>

          <ul className="mt-3 space-y-1 text-ink/80">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.name} ({item.size}) &times; {item.qty} &mdash; Rs.{" "}
                {(item.price * item.qty).toLocaleString()}
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/70">Order status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full rounded-md border border-sand bg-white px-2 py-1.5 text-sm outline-none focus:border-clay"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/70">Tracking ID</label>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Not booked yet"
                className="w-full rounded-md border border-sand bg-white px-2 py-1.5 text-sm outline-none focus:border-clay"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-cream hover:bg-clay disabled:opacity-50"
            >
              Save
            </button>
            <p className="self-center text-xs text-ink/50">Courier API will be connected later.</p>
          </div>
        </div>
      )}
    </div>
  );
}
