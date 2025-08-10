import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingCart, Settings, Plus } from "lucide-react";

interface AdminNavigationProps {
  user: {
    name: string;
    role: string;
  };
}

export function AdminNavigation({ user }: AdminNavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <Badge variant="secondary" className="text-xs">
                {user.role}
              </Badge>
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/group-orders/create"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Order
              </Link>
              <Link
                href="/products"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Products
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              Welcome, {user.name}
            </span>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ShoppingCart className="h-4 w-4 mr-2" />
                User Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}