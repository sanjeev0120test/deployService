import { NextRequest, NextResponse } from "next/server";
import { getProducts, addProduct } from "@/lib/store";

export async function GET() {
  const products = getProducts();
  return NextResponse.json({ data: products, total: products.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, category } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (price === undefined || typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "price is required and must be a non-negative number" },
        { status: 400 }
      );
    }

    const product = addProduct({
      name: name.trim(),
      price,
      category: category?.trim() || "general",
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
