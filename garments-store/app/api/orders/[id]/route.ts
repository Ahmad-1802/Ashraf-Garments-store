import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await getOrder(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const allowedPaymentStatuses = ["cod", "pending", "paid", "failed"];

  if (body.orderStatus !== undefined && !allowedStatuses.includes(body.orderStatus)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }
  if (body.paymentStatus !== undefined && !allowedPaymentStatuses.includes(body.paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  }

  const order = await updateOrder(params.id, {
    orderStatus: body.orderStatus,
    paymentStatus: body.paymentStatus,
    courierTrackingId: body.courierTrackingId ? String(body.courierTrackingId).slice(0, 100) : undefined,
    courierProvider: body.courierProvider ? String(body.courierProvider).slice(0, 50) : undefined
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
