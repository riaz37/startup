import { NextResponse } from "next/server";
import { seedCategories } from "@/lib/database/seed-categories";
import { seedProducts } from "@/lib/database/seed-products";

export async function GET() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Seed categories first
    await seedCategories();
    console.log("✅ Categories seeded successfully");
    
    // Seed products
    await seedProducts();
    console.log("✅ Products seeded successfully");
    
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with sample data"
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 