import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Sohozdaam
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              The smart way to shop together and save money. Join group orders
              and unlock amazing discounts on your favorite products.
            </p>
            <div className="flex space-x-4">
              <Badge variant="outline">🔒 Secure</Badge>
              <Badge variant="outline">⚡ Fast</Badge>
              <Badge variant="outline">💰 Savings</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <div className="space-y-2">
              <Link
                href="/products"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Products
              </Link>
              <Link
                href="/group-orders"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Group Orders
              </Link>
              <Link
                href="/about"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <Link
                href="/help"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>
            &copy; 2025 Sohozdaam. All rights reserved. Made with ❤️ for smart
            shoppers.
          </p>
        </div>
      </div>
    </footer>
  );
}