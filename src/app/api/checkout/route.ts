import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib";
import { CartService } from "@/lib/services/cart-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { addressId, deliveryType, notes, cartItems } = body;

    // Validate required fields
    if (!addressId || !deliveryType || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Address ID, delivery type, and cart items are required" },
        { status: 400 }
      );
    }

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate cart items and products
    const validatedItems = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      if (item.orderType !== 'priority') {
        return NextResponse.json(
          { error: "Only priority orders are supported for checkout" },
          { status: 400 }
        );
      }

      // Validate product exists and is active
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          category: true,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product is not available: ${product.name}` },
          { status: 400 }
        );
      }

      // Validate quantity
      if (item.quantity < product.minOrderQty) {
        return NextResponse.json(
          { error: `Minimum order quantity for ${product.name} is ${product.minOrderQty}` },
          { status: 400 }
        );
      }

      if (product.maxOrderQty && item.quantity > product.maxOrderQty) {
        return NextResponse.json(
          { error: `Maximum order quantity for ${product.name} is ${product.maxOrderQty}` },
          { status: 400 }
        );
      }

      const itemTotal = item.quantity * product.mrp;
      totalAmount += itemTotal;

      validatedItems.push({
        product,
        quantity: item.quantity,
        unitPrice: product.mrp,
        totalPrice: itemTotal,
      });
    }

    // Generate order number
    const orderNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create priority orders with transaction
    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const item of validatedItems) {
        // Create priority order
        const priorityOrder = await tx.priorityOrder.create({
          data: {
            productId: item.product.id,
            userId: user.id,
            addressId,
            orderNumber: `${orderNumber}-${item.product.id.slice(-4)}`,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalAmount: item.totalPrice,
            deliveryType,
            notes: notes || undefined,
            status: "PENDING",
            paymentStatus: "PENDING",
          },
          include: {
            product: {
              include: {
                category: true,
              },
            },
            address: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Create priority order item
        await tx.priorityOrderItem.create({
          data: {
            priorityOrderId: priorityOrder.id,
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });

        orders.push(priorityOrder);
      }

      return orders;
    });

    // Create notifications for each order
    for (const order of createdOrders) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "PRIORITY_ORDER_CONFIRMED",
          title: "Priority Order Placed",
          message: `Your priority order for ${order.product.name} has been placed successfully. Order number: ${order.orderNumber}`,
          data: { priorityOrderId: order.id, productName: order.product.name },
        },
      });
    }

    // Clear the cart after successful checkout
    try {
      await CartService.clearCart(user.id);
    } catch (error) {
      console.warn("Failed to clear cart after checkout:", error);
      // Don't fail the checkout if cart clearing fails
    }

    return NextResponse.json({
      success: true,
      orders: createdOrders,
      totalAmount,
      message: `Successfully created ${createdOrders.length} priority order(s)`,
    }, { status: 201 });

  } catch (error) {
    console.error("Error during checkout:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
} 