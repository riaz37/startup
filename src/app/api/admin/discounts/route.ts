import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib";
import { DiscountService } from "@/lib/services/discount-service";

// GET /api/admin/discounts - Get all discount configurations
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discounts = await DiscountService.getAllDiscountConfigs();
    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/discounts - Create new discount configuration
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const discount = await DiscountService.createDiscountConfig(body);
    
    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
} 