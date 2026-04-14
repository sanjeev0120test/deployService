import { NextResponse } from "next/server";
import { getProductById } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return NextResponse.json(
      { error: "Product not found", id },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: product });
}
