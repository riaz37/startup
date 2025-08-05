import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id: id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            unitSize: true,
            imageUrl: true,
            description: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        orders: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            items: {
              select: {
                quantity: true,
                unitPrice: true,
                totalPrice: true
              }
            }
          },
          orderBy: {
            placedAt: "desc"
          }
        }
      }
    });

    if (!groupOrder) {
      return NextResponse.json(
        { error: "Group order not found" },
        { status: 404 }
      );
    }

    // Calculate progress
    const progressPercentage = Math.min(
      (groupOrder.currentAmount / groupOrder.minThreshold) * 100,
      100
    );

    const timeRemaining = Math.max(
      0,
      Math.floor((groupOrder.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return NextResponse.json({
      ...groupOrder,
      progressPercentage,
      participantCount: groupOrder.orders.length,
      timeRemaining
    });
  } catch (error) {
    console.error("Error fetching group order:", error);
    return NextResponse.json(
      { error: "Failed to fetch group order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can update group orders." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, actualDelivery } = body;

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (actualDelivery) {
      updateData.actualDelivery = new Date(actualDelivery);
    }

    const groupOrder = await prisma.groupOrder.update({
      where: { id: id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            unitSize: true
          }
        }
      }
    });

    return NextResponse.json(groupOrder);
  } catch (error) {
    console.error("Error updating group order:", error);
    return NextResponse.json(
      { error: "Failed to update group order" },
      { status: 500 }
    );
  }
}