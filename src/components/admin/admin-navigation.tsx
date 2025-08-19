"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingCart, Settings, Plus, Menu, X } from "lucide-react";

interface AdminNavigationProps {
  user: {
    name?: string | null;
    role: string;
  };
}

export function AdminNavigation({ user }: AdminNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/admin" className="flex items-center space-x-2 mobile-touch-target">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <Badge variant="secondary" className="text-xs hidden sm:block">
                {user.role}
              </Badge>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex space-x-6">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Orders
              </Link>
              <Link
                href="/admin/group-orders"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Group Orders
              </Link>
              <Link
                href="/admin/group-orders/create"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Create Order
              </Link>
              <Link
                href="/admin/products"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Products
              </Link>
              <Link
                href="/admin/categories"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Categories
              </Link>
              <Link
                href="/admin/price-management"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Price Management
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-responsive-sm text-muted-foreground">
                Welcome, {user.name}
              </span>
              <Button variant="outline" asChild className="mobile-touch-target">
                <Link href="/dashboard">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  User Dashboard
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mobile-touch-target"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Mobile Menu Overlay */}
            <div 
              className="mobile-nav-overlay lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="mobile-nav-menu lg:hidden">
              <div className="p-4 space-y-4">
                {/* User Info */}
                <div className="border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link
                    href="/admin"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/admin/group-orders"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Group Orders
                  </Link>
                  <Link
                    href="/admin/group-orders/create"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Order
                  </Link>
                  <Link
                    href="/admin/products"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    href="/admin/categories"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/admin/price-management"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Price Management
                  </Link>
                </div>
                
                {/* Mobile User Actions */}
                <div className="border-t pt-4 space-y-3">
                  <Button variant="outline" className="w-full mobile-touch-target" asChild>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      User Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}