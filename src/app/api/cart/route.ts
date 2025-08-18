import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { CartService } from "@/lib/services/cart-service";
import { AddToCartRequest, UpdateCartItemRequest } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id") || 
                     request.cookies.get("guest-session-id")?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "No user or session provided" },
        { status: 400 }
      );
    }

    console.log("Fetching cart for:", { userId: user?.id, sessionId });

    const cart = await CartService.getOrCreateCart(
      user?.id,
      sessionId
    );

    console.log("Cart fetched successfully:", { cartId: cart.id, itemCount: cart.items.length });

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Redis")) {
        return NextResponse.json(
          { error: "Cart service temporarily unavailable" },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id") || 
                     request.cookies.get("guest-session-id")?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "No user or session provided" },
        { status: 400 }
      );
    }

    const body: AddToCartRequest = await request.json();
    
    // Validate request body
    if (!body.productId || !body.quantity || !body.orderType) {
      return NextResponse.json(
        { error: "Product ID, quantity, and order type are required" },
        { status: 400 }
      );
    }

    // Validate order type
    if (!["priority", "group"].includes(body.orderType)) {
      return NextResponse.json(
        { error: "Order type must be 'priority' or 'group'" },
        { status: 400 }
      );
    }

    // Validate group order ID for group orders
    if (body.orderType === "group" && !body.groupOrderId) {
      return NextResponse.json(
        { error: "Group order ID is required for group orders" },
        { status: 400 }
      );
    }

    const cart = await CartService.addToCart(
      body,
      user?.id,
      sessionId
    );

    // Set guest session cookie if needed
    const response = NextResponse.json({ cart });
    
    if (!user && sessionId) {
      response.cookies.set("guest-session-id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error("Error adding to cart:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id") || 
                     request.cookies.get("guest-session-id")?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "No user or session provided" },
        { status: 400 }
      );
    }

    const body: UpdateCartItemRequest = await request.json();
    
    if (!body.itemId || body.quantity === undefined) {
      return NextResponse.json(
        { error: "Item ID and quantity are required" },
        { status: 400 }
      );
    }

    const cart = await CartService.updateCartItem(
      body,
      user?.id,
      sessionId
    );

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id") || 
                     request.cookies.get("guest-session-id")?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "No user or session provided" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const cart = await CartService.removeFromCart(
      itemId,
      user?.id,
      sessionId
    );

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error removing cart item:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
} 