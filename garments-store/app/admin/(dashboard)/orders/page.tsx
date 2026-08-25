import { getOrders } from "@/lib/db";
import OrderRow from "@/components/admin/OrderRow";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-ink/60">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
