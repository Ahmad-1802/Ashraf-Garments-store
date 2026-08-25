import { NextRequest, NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { Section } from "@/lib/types";

const VALID_SECTIONS: Section[] = ["Boys", "Girls", "Uniforms"];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const price = body.price !== undefined ? Number(body.price) : undefined;
  if (price !== undefined && (!Number.isFinite(price) || price <= 0)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }
  if (body.section !== undefined && !VALID_SECTIONS.includes(body.section as Section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const product = await updateProduct(params.id, {
    name: body.name !== undefined ? String(body.name).trim().slice(0, 200) : undefined,
    description: body.description !== undefined ? String(body.description).slice(0, 2000) : undefined,
    price,
    section: body.section !== undefined ? (body.section as Section) : undefined,
    subCategory: body.subCategory !== undefined ? String(body.subCategory).trim().slice(0, 100) : undefined,
    image: body.image !== undefined ? String(body.image).trim() : undefined,
    variants: body.variants !== undefined
      ? body.variants.map((v: any) => ({ size: String(v.size ?? "").trim(), stock: Number(v.stock) }))
      : undefined
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteProduct(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
