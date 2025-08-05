import { Role } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN, Role.SUPER_ADMIN]);
}

export async function requireSuperAdmin() {
  return requireRole([Role.SUPER_ADMIN]);
}

export async function requireVerified() {
  const user = await requireAuth();
  if (!user.isVerified) {
    redirect("/auth/verify-email");
  }
  return user;
}

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export function isSuperAdmin(role: Role): boolean {
  return role === Role.SUPER_ADMIN;
}