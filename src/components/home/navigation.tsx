"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileDropdown } from "@/components/navigation/user-profile-dropdown";
import { CartDrawer } from "@/components/cart";
import { ShoppingCart, Menu, X } from "lucide-react";

interface NavigationProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role: string;
    isVerified: boolean;
    image?: string | null;
  } | null;
}

export function Navigation({ user }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2 mobile-touch-target">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Sohozdaam
              </span>
              <Badge variant="secondary" className="text-xs hidden sm:block">
                Beta
              </Badge>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex space-x-6">
              <Link
                href="/products"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Products
              </Link>
              <Link
                href="/group-orders"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Group Orders
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                About
              </Link>
              <Link
                href="/help"
                className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target px-3 py-2"
              >
                Help
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart - Show on all screen sizes */}
            <CartDrawer />
            
            <ThemeToggle />
            
            {/* Mobile menu button - Always visible on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mobile-touch-target"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Desktop user menu */}
            <div className="hidden lg:flex">
              {user ? (
                <UserProfileDropdown user={user} />
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" asChild className="mobile-touch-target">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button asChild className="mobile-touch-target">
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
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
                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link
                    href="/products"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    href="/group-orders"
                    className="text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted block px-3 py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Group Orders
                  </Link>
                  <Link
                    href="/about"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/help"
                    className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted"
                  >
                    Help
                  </Link>
                </div>
                
                {/* Mobile User Section */}
                <div className="border-t pt-4 space-y-3">
                  {user ? (
                    <div className="px-3">
                      <UserProfileDropdown user={user} />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button variant="ghost" className="w-full justify-start mobile-touch-target" asChild>
                        <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button className="w-full mobile-touch-target" asChild>
                        <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}