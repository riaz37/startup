"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  User,
  Settings,
  ShoppingCart,
  Package,
  Users,
  HelpCircle,
  LogOut,
  Shield,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface UserProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    isVerified: boolean;
    image?: string | null;
  };
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarImage
            src={user.image || undefined}
            alt={user.name || "User"}
          />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {user.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.email || "No email"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {user.role}
              </Badge>
              {user.isVerified ? (
                <Badge className="badge-success text-xs">Verified</Badge>
              ) : (
                <Badge className="badge-warning text-xs">Unverified</Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Dashboard */}
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        {/* My Orders */}
        <DropdownMenuItem asChild>
          <Link href="/orders" className="flex items-center">
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>

        {/* Group Orders */}
        <DropdownMenuItem asChild>
          <Link href="/group-orders" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Group Orders</span>
          </Link>
        </DropdownMenuItem>

        {/* Products */}
        <DropdownMenuItem asChild>
          <Link href="/products" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Profile Settings */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>

        {/* Account Settings */}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>

        {/* Help */}
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </Link>
        </DropdownMenuItem>

        {/* Admin Panel (if admin) */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center text-primary">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <SignOutButton className="flex items-center w-full p-0 h-auto bg-transparent hover:bg-transparent text-red-600 hover:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
