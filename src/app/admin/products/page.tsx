"use client";

import { MainContainer } from "@/components/layout";
import { AdminNavigation } from "@/components/admin";
import { ProductManagementPanel } from "@/components/admin/product-management-panel";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <MainContainer>
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={{ name: user?.name || 'Admin', role: user?.role || 'ADMIN' }} />
      <MainContainer>
        <ProductManagementPanel />
      </MainContainer>
    </div>
  );
} 