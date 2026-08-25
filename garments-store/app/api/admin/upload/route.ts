import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAdminRequest } from "@/lib/auth";

// Uploads a single product image.
// Production (Supabase configured): stored in the "product-images" Storage bucket,
// which must be created and set to public in the Supabase dashboard first
// (Storage -> New bucket -> name "product-images" -> Public bucket: on).
// Local dev fallback (no Supabase env vars): written to /public/uploads.

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);

function extensionFor(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WEBP, or GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file.type)}`;

  if (useSupabase) {
    const url = supabaseUrl!.replace(/\/$/, "");
    const uploadRes = await fetch(
      `${url}/storage/v1/object/product-images/${filename}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type
        },
        body: bytes
      }
    );

    if (!uploadRes.ok) {
      const message = await uploadRes.text();
      return NextResponse.json(
        { error: `Upload failed: ${message}` },
        { status: 502 }
      );
    }

    const publicUrl = `${url}/storage/v1/object/public/product-images/${filename}`;
    return NextResponse.json({ url: publicUrl });
  }

  // Local dev fallback
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
