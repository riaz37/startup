'use client';

import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { GroupOrderCard } from "@/components/group-orders/group-order-card";
import { Users, Badge } from "lucide-react";
import { useActiveGroupOrders } from "@/hooks/api";

interface GroupOrder {
  id: string;
  batchNumber: string;
  minThreshold: number;
  currentAmount: number;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: number;
  status: string;
  expiresAt: string;
  estimatedDelivery: string | null;
  progressPercentage: number;
  participantCount: number;
  timeRemaining: number;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
    imageUrl: string | null;
    category: {
      name: string;
    };
  };
}

export default function GroupOrdersPage() {
  // Use the new hook
  const { data: groupOrdersResponse, isLoading, error } = useActiveGroupOrders();
  
  const groupOrders = groupOrdersResponse || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "collecting":
        return <Badge className="badge-warning">Collecting Orders</Badge>;
      case "threshold_met":
        return <Badge className="badge-success">Threshold Met</Badge>;
      case "processing":
        return <Badge className="badge-secondary">Processing</Badge>;
      case "shipped":
        return <Badge className="badge-primary">Shipped</Badge>;
      case "delivered":
        return <Badge className="badge-success">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading group orders: {error.message}</p>
            </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="🛒 Active Group Orders"
          title="Join Group Orders & Save Big"
          highlightedWord="Save Big"
          description="Discover active group orders and join others to unlock bulk pricing on quality products. The more people join, the bigger the savings!"
        />

        {/* Group Orders Grid */}
        {groupOrders.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Active Group Orders"
            description="Check back later for new group ordering opportunities, or create your own!"
            actionLabel="Create Group Order"
            actionHref="/admin/group-orders/create"
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {groupOrders.map((groupOrder) => (
              <GroupOrderCard
                key={groupOrder.id}
                groupOrder={groupOrder}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </MainContainer>
    </PageLayout>
  );
}