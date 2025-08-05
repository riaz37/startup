import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    // Note: You might want to create a separate PasswordReset table for better security
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You'll need to add these fields to your User model
        // resetToken,
        // resetTokenExpiry
      }
    });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    console.log(`Password reset requested for ${email}. Reset token: ${resetToken}`);

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a password reset link." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}