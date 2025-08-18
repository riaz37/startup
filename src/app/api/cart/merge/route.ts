import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { CartService } from "@/lib/services/cart-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "User must be authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Merge guest cart with user cart
    const mergedCart = await CartService.mergeGuestCart(sessionId, user.id);

    // Clear the guest session cookie
    const response = NextResponse.json({ 
      cart: mergedCart,
      message: "Guest cart merged successfully" 
    });
    
    response.cookies.delete("guest-session-id");

    return response;
  } catch (error) {
    console.error("Error merging cart:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 }
    );
  }
} 