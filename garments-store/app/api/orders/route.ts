import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrderSecure } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getOrders());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = body.customer;
    const items = body.items;

    if (!Array.isArray(items) || items.length === 0 || !customer) {
      return NextResponse.json({ error: "Missing order details" }, { status: 400 });
    }

    if (body.paymentMethod && body.paymentMethod !== "cod") {
      return NextResponse.json(
        { error: "Online payments are not enabled yet. Please choose Cash on Delivery." },
        { status: 400 }
      );
    }

    const name = String(customer.name ?? "").trim();
    const phone = String(customer.phone ?? "").trim();
    const address = String(customer.address ?? "").trim();
    const city = String(customer.city ?? "").trim();

    if (!name || !phone || !address || !city || name.length > 100 || phone.length > 30 || address.length > 500 || city.length > 100) {
      return NextResponse.json({ error: "Please provide valid customer details." }, { status: 400 });
    }

    const normalizedItems = items.map((item: any) => ({
      productId: String(item.productId ?? ""),
      size: String(item.size ?? "").trim(),
      qty: Number(item.qty)
    }));

    if (normalizedItems.some((item: any) => !item.productId || !item.size || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50)) {
      return NextResponse.json({ error: "Invalid cart items." }, { status: 400 });
    }

    // Important: the server recalculates prices from the catalog. The client
    // cannot choose the order total or product price.
    const order = await createOrderSecure({
      items: normalizedItems,
      customer: { name, phone, address, city },
      paymentMethod: "cod"
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
