import { Role } from "@/generated/prisma";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    isVerified: boolean;
  }
}