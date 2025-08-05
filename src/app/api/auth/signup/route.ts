import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signUpSchema.parse(body);
    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false, // Email verification required
        role: "CUSTOMER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, user.id);

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        user
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}