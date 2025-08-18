import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib";

// GET /api/admin/group-orders/[id] - Get group order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        orders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: true,
          },
        },
      },
    });

    if (!groupOrder) {
      return NextResponse.json({ error: "Group order not found" }, { status: 404 });
    }

    return NextResponse.json(groupOrder);
  } catch (error) {
    console.error("Error fetching group order:", error);
    return NextResponse.json(
      { error: "Failed to fetch group order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    
    const { id } = await params;

    // Check if group order exists
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            items: {
              select: {
                quantity: true,
              },
            },
          },
        },
      },
    });

    if (!groupOrder) {
      return NextResponse.json({ error: "Group order not found" }, { status: 404 });
    }

    // Check if group order can be deleted (only if no orders or all orders are unpaid)
    if (groupOrder.orders.length > 0) {
      // Check if any orders have already been paid
      const hasPaidOrders = groupOrder.orders.some(o => o.totalAmount > 0);
      
      if (hasPaidOrders) {
        return NextResponse.json(
          { error: "Cannot delete group order with paid orders" },
          { status: 400 }
        );
      }
    }

    // Log the deletion (using console.log since groupOrderLog table doesn't exist)
    console.log(`Group order ${id} deleted by admin ${user.id}`, {
      deletedAt: new Date().toISOString(),
      orderCount: groupOrder.orders.length,
    });

    // Delete orders first (if any)
    if (groupOrder.orders.length > 0) {
      await prisma.order.deleteMany({
        where: { groupOrderId: id },
      });
    }

    // Delete the group order
    await prisma.groupOrder.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "Group order deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting group order:", error);
    return NextResponse.json(
      { error: "Failed to delete group order" },
      { status: 500 }
    );
  }
} 