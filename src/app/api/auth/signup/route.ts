import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma, signUpSchema } from "@/lib";
import { handleApiError } from "@/lib/utils";
import { dynamicEmailService } from "@/lib/email/dynamic-email-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);
    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user and verification token in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          isVerified: false,
          role: "CUSTOMER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      await tx.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt: tokenExpiry,
        },
      });

      return user;
    });

    // Send verification email
    try {
      await dynamicEmailService.sendWelcomeEmail({
        to: email,
        userName: name,
        verificationUrl: `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`,
        userId: result.id
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the signup if email fails
    }

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email to verify your account.",
        user: result,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.error, details: errorResponse.details },
      { status: errorResponse.status }
    );
  }
}
