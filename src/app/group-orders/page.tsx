import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { GroupOrderCard } from "@/components/group-orders/group-order-card";
import { Users } from "lucide-react";
import { prisma } from "@/lib/database";
import { GroupOrder } from "@/types";

export default async function GroupOrdersPage() {
  // Fetch data server-side directly from database
  let groupOrders: GroupOrder[] = [];
  let error: Error | null = null;
  
  try {
    const activeGroupOrders = await prisma.groupOrder.findMany({
      where: {
        status: 'COLLECTING',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected GroupOrder type
    groupOrders = activeGroupOrders.map((go) => ({
      id: go.id,
      productId: go.productId,
      productName: go.product.name,
      batchNumber: go.batchNumber,
      minThreshold: go.minThreshold,
      currentAmount: go.currentAmount,
      targetQuantity: go.targetQuantity,
      currentQuantity: go.currentQuantity,
      pricePerUnit: go.pricePerUnit,
      status: go.status,
      expiresAt: go.expiresAt.toISOString(),
      estimatedDelivery: go.estimatedDelivery?.toISOString() || null,
      progressPercentage: go.targetQuantity > 0 
        ? Math.min((go.currentQuantity / go.targetQuantity) * 100, 100)
        : 0,
      participantCount: 0, // This would need a separate query to count orders
      timeRemaining: (() => {
        const now = new Date();
        const expiresAt = go.expiresAt;
        
        // Set both dates to start of day for consistent day calculation
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfExpiry = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
        
        // Calculate the difference in days
        const diffTime = startOfExpiry.getTime() - startOfToday.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 0) return 0; // Expired or expires today
        
        return Math.round(diffDays);
      })(),
      product: {
        id: go.product.id,
        name: go.product.name,
        unit: go.product.unit,
        unitSize: go.product.unitSize,
        imageUrl: go.product.imageUrl,
        category: {
          name: go.product.category.name,
        },
      },
    }));
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to fetch group orders');
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

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