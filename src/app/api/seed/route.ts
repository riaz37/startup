import { NextRequest, NextResponse } from "next/server";
import { seedProducts } from "@/lib/seed-products";

export async function POST(request: NextRequest) {
  try {
    // In production, you might want to add authentication here
    const result = await seedProducts();
    
    return NextResponse.json({
      message: "Database seeded successfully",
      ...result
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}