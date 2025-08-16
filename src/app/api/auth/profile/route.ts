import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib";
import { updateProfileSchema } from "@/lib";
import { getCurrentUser } from "@/lib";
import { handleApiError } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile from database
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        image: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: profile }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get profile error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body);
    const { name, email } = validatedData;

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        // If email changed, mark as unverified
        ...(email !== user.email && { isVerified: false, emailVerified: null })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        image: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(
      { 
        message: email !== user.email 
          ? "Profile updated successfully. Please verify your new email address." 
          : "Profile updated successfully",
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.error, details: errorResponse.details },
      { status: errorResponse.status }
    );
  }
}