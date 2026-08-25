import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { Section } from "@/lib/types";

const VALID_SECTIONS: Section[] = ["Boys", "Girls", "Uniforms"];

export async function GET() {
  return NextResponse.json(await getProducts());
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const price = Number(body.price);
  const section = String(body.section ?? "");

  if (
    !String(body.name ?? "").trim() ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Array.isArray(body.variants) ||
    !VALID_SECTIONS.includes(section as Section)
  ) {
    return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
  }

  const variants = body.variants.map((v: any) => ({ size: String(v.size ?? "").trim(), stock: Number(v.stock) }));
  if (variants.some((v: any) => !v.size || !Number.isInteger(v.stock) || v.stock < 0)) {
    return NextResponse.json({ error: "Invalid variants" }, { status: 400 });
  }

  const product = await createProduct({
    name: String(body.name).trim().slice(0, 200),
    description: String(body.description ?? "").slice(0, 2000),
    price,
    section: section as Section,
    subCategory: String(body.subCategory ?? "").trim().slice(0, 100),
    image: String(body.image ?? "").trim(),
    variants
  });

  return NextResponse.json(product, { status: 201 });
}
