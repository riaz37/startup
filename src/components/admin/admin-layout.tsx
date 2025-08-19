"use client";

import { useState } from "react";
import { AdminNavigation } from "./admin-navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    role: string;
  };
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-layout-responsive">
      {/* Admin Navigation */}
      <AdminNavigation user={user} />
      
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mobile-touch-target"
        >
          {isSidebarOpen ? (
            <X className="h-4 w-4 mr-2" />
          ) : (
            <Menu className="h-4 w-4 mr-2" />
          )}
          Admin Menu
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar-responsive ${isSidebarOpen ? 'open' : ''}`}>
        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="font-medium text-responsive-sm">{user.name}</p>
                <p className="text-responsive-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <AdminNavLink href="/admin" label="Dashboard" />
            <AdminNavLink href="/admin/analytics" label="Analytics" />
            <AdminNavLink href="/admin/orders" label="Orders" />
            <AdminNavLink href="/admin/group-orders" label="Group Orders" />
            <AdminNavLink href="/admin/products" label="Products" />
            <AdminNavLink href="/admin/categories" label="Categories" />
            <AdminNavLink href="/admin/users" label="Users" />
            <AdminNavLink href="/admin/price-management" label="Price Management" />
            <AdminNavLink href="/admin/discounts" label="Discounts" />
            <AdminNavLink href="/admin/email-management" label="Email Management" />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content-responsive">
        {children}
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="mobile-nav-overlay lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

interface AdminNavLinkProps {
  href: string;
  label: string;
}

function AdminNavLink({ href, label }: AdminNavLinkProps) {
  return (
    <a
      href={href}
      className="block px-3 py-3 text-muted-foreground hover:text-foreground transition-colors mobile-touch-target rounded-lg hover:bg-muted text-responsive-sm"
    >
      {label}
    </a>
  );
} 