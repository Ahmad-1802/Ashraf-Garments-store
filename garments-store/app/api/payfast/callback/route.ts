import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "PayFast is not enabled yet." },
    { status: 501 }
  );
}
