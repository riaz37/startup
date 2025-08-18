import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch recent orders
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        groupOrder: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        },
        items: {
          select: {
            quantity: true
          }
        }
      },
      orderBy: {
        createdAt: "desc" // Using createdAt instead of placedAt
      },
      take: 5 // Show only recent 5 orders
    });

    // Transform the data
    const recentOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(-6), // Generate order number from ID
      totalAmount: order.totalAmount,
      status: order.status,
      placedAt: order.createdAt.toISOString(),
      groupOrder: order.groupOrder ? {
        batchNumber: order.groupOrder.batchNumber || 'N/A',
        status: order.groupOrder.status,
        product: {
          name: order.groupOrder.product.name,
          imageUrl: order.groupOrder.product.imageUrl
        }
      } : null,
      items: order.items.map(item => ({
        quantity: item.quantity
      }))
    }));

    return NextResponse.json({ orders: recentOrders });

  } catch (error) {
    console.error('Order history API error:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 