import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "z";

const bulkOperationSchema = z.object({
  operation: z.enum(["activate", "deactivate", "delete"]),
  productIds: z.array(z.string()).min(1, "At least one product ID is required")
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const validatedData = bulkOperationSchema.parse(body);
    
    const { operation, productIds } = validatedData;
    
    // Verify all products exist
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    
    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some product IDs are invalid" },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (operation) {
      case "activate":
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: true }
        });
        break;
        
      case "deactivate":
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: false }
        });
        break;
        
      case "delete":
        // Check if any products are being used in orders
        const orderCount = await prisma.orderItem.count({
          where: { productId: { in: productIds } }
        });
        
        if (orderCount > 0) {
          return NextResponse.json(
            { error: "Cannot delete products that have been ordered" },
            { status: 400 }
          );
        }
        
        result = await prisma.product.deleteMany({
          where: { id: { in: productIds } }
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
    console.error("Error performing bulk product operation:", error);
    
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