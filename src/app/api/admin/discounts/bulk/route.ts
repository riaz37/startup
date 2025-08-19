import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "z";

const bulkOperationSchema = z.object({
  operation: z.enum(["activate", "deactivate", "delete"]),
  discountIds: z.array(z.string()).min(1, "At least one discount ID is required")
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const validatedData = bulkOperationSchema.parse(body);
    
    const { operation, discountIds } = validatedData;
    
    // Verify all discounts exist
    const existingDiscounts = await prisma.discountConfig.findMany({
      where: { id: { in: discountIds } }
    });
    
    if (existingDiscounts.length !== discountIds.length) {
      return NextResponse.json(
        { error: "Some discount IDs are invalid" },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (operation) {
      case "activate":
        result = await prisma.discountConfig.updateMany({
          where: { id: { in: discountIds } },
          data: { isActive: true }
        });
        break;
        
      case "deactivate":
        result = await prisma.discountConfig.updateMany({
          where: { id: { in: discountIds } },
          data: { isActive: false }
        });
        break;
        
      case "delete":
        result = await prisma.discountConfig.deleteMany({
          where: { id: { in: discountIds } }
        });
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      message: `Bulk operation '${operation}' completed successfully`,
      affectedCount: result.count
    });
    
  } catch (error: any) {
    console.error("Error performing bulk discount operation:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
} 