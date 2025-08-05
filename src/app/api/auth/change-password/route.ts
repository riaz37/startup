import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations/auth";
import { getCurrentUser } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/error-utils";

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
    
    // Validate input
    const validatedData = changePasswordSchema.parse(body);
    const { currentPassword, newPassword } = validatedData;

    // Get user with password from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true }
    });

    if (!dbUser || !dbUser.password) {
      return NextResponse.json(
        { error: "User not found or no password set" },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
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