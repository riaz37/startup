import { NextResponse } from "next/server";
import { seedGroupOrders } from "@/lib/database/seed-group-orders";

export async function GET() {
  try {
    console.log("🌱 Starting group orders seeding...");
    
    const result = await seedGroupOrders();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Group orders seeded successfully: ${result.count} created/updated`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No products found. Please seed products first."
      });
    }
  } catch (error) {
    console.error("❌ Error seeding group orders:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to seed group orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 