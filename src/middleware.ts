import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!token || (token.role !== Role.ADMIN && token.role !== Role.SUPER_ADMIN)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Super admin routes protection
    if (pathname.startsWith("/super-admin")) {
      if (!token || token.role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Customer dashboard protection
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Email verification requirement for certain routes
    const requiresVerification = ["/dashboard", "/orders", "/profile"];
    if (requiresVerification.some(route => pathname.startsWith(route))) {
      if (token && !token.isVerified) {
        return NextResponse.redirect(new URL("/auth/verify-email", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/auth/signin",
          "/auth/signup",
          "/auth/error",
          "/auth/verify-email",
          "/unauthorized",
          "/api/auth"
        ];

        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"
  ]
};