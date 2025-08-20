import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib";
import { dynamicEmailService } from "@/lib/email/dynamic-email-service";
import { handleApiError, isZodError } from "@/lib/utils";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = resendSchema.parse(body);
    const { email } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists and is unverified, we've sent a verification email." },
        { status: 200 }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete existing verification tokens and create new one
    await prisma.$transaction(async (tx) => {
      await tx.emailVerification.deleteMany({
        where: { userId: user.id }
      });

      await tx.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt: tokenExpiry
        }
      });
    });

    // Send verification email
    try {
      await dynamicEmailService.sendWelcomeEmail({
        to: email,
        userName: user.name || 'there',
        verificationUrl: `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: "If an account with that email exists and is unverified, we've sent a verification email." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Resend verification error:", error);

    if (isZodError(error)) {
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