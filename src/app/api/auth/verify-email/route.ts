import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { handleApiError } from "@/lib/error-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationRecord = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationRecord || verificationRecord.verified) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Update user as verified and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verificationRecord.userId },
        data: { 
          isVerified: true,
          emailVerified: new Date()
        }
      });

      await tx.emailVerification.update({
        where: { id: verificationRecord.id },
        data: { verified: true }
      });
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(verificationRecord.user.email, verificationRecord.user.name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the verification if welcome email fails
    }

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

// Handle GET requests for email verification links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?error=MissingToken', request.url));
    }

    // Find the verification token
    const verificationRecord = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationRecord || verificationRecord.verified) {
      return NextResponse.redirect(new URL('/auth/error?error=InvalidToken', request.url));
    }

    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/auth/error?error=ExpiredToken', request.url));
    }

    // Update user as verified and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verificationRecord.userId },
        data: { 
          isVerified: true,
          emailVerified: new Date()
        }
      });

      await tx.emailVerification.update({
        where: { id: verificationRecord.id },
        data: { verified: true }
      });
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(verificationRecord.user.email, verificationRecord.user.name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/email-verified', request.url));
  } catch (error: unknown) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL('/auth/error?error=ServerError', request.url));
  }
}