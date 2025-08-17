"use client";

import { ClientPageLayout, MainContainer } from "@/components/layout";
import { AdminNavigation } from "@/components/admin";
import { PriceManagementPanel } from "@/components/admin/price-management-panel";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function PriceManagementPage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <ClientPageLayout hideNavigation={true}>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  if (!user) {
    return (
      <ClientPageLayout hideNavigation={true}>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading...</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  return (
    <ClientPageLayout user={user} hideNavigation={true}>
      <AdminNavigation user={{ name: user?.name || 'Admin', role: user?.role || 'ADMIN' }} />
      <MainContainer>
        <PriceManagementPanel />
      </MainContainer>
    </ClientPageLayout>
  );
} 