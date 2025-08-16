import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib";
import { getCurrentUser } from "@/lib";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      expiresAt: {
        gte: new Date() // Only show non-expired orders
      }
    };

    const [groupOrders, total] = await Promise.all([
      prisma.groupOrder.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true,
              unitSize: true,
              imageUrl: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          },
          orders: {
            select: {
              id: true,
              totalAmount: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.groupOrder.count({ where })
    ]);

    // Calculate progress for each group order
    const groupOrdersWithProgress = groupOrders.map(groupOrder => ({
      ...groupOrder,
      progressPercentage: Math.min(
        (groupOrder.currentAmount / groupOrder.minThreshold) * 100,
        100
      ),
      participantCount: groupOrder._count.orders,
      timeRemaining: Math.max(
        0,
        Math.floor((groupOrder.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    }));

    return NextResponse.json({
      groupOrders: groupOrdersWithProgress,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching group orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch group orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can create group orders." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      productId,
      minThreshold,
      targetQuantity,
      pricePerUnit,
      expiresAt,
      estimatedDelivery
    } = body;

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Generate batch number
    const count = await prisma.groupOrder.count();
    const batchNumber = `GO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const groupOrder = await prisma.groupOrder.create({
      data: {
        productId,
        batchNumber,
        minThreshold: parseFloat(minThreshold),
        targetQuantity: parseInt(targetQuantity),
        pricePerUnit: parseFloat(pricePerUnit),
        expiresAt: new Date(expiresAt),
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        status: "COLLECTING"
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            unitSize: true,
            imageUrl: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(groupOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating group order:", error);
    return NextResponse.json(
      { error: "Failed to create group order" },
      { status: 500 }
    );
  }
}