import { getCurrentUser } from "@/lib/auth-utils";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { GroupOrderCard } from "@/components/group-orders/group-order-card";
import { Users } from "lucide-react";
import Link from "next/link";

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

interface GroupOrdersResponse {
  groupOrders: GroupOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function getGroupOrders(): Promise<GroupOrdersResponse> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/group-orders?status=COLLECTING`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch group orders");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching group orders:", error);
    return {
      groupOrders: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    };
  }
}

export default async function GroupOrdersPage() {
  const user = await getCurrentUser();
  const { groupOrders } = await getGroupOrders();

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
      case "COLLECTING":
        return <Badge className="badge-warning">Collecting Orders</Badge>;
      case "THRESHOLD_MET":
        return <Badge className="badge-success">Threshold Met</Badge>;
      case "ORDERED":
        return <Badge className="badge-secondary">Ordered</Badge>;
      case "SHIPPED":
        return <Badge className="badge-primary">Shipped</Badge>;
      case "DELIVERED":
        return <Badge className="badge-success">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            actionLabel={user ? "Create Group Order" : undefined}
            actionHref={user ? "/admin/group-orders/create" : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {groupOrders.map((groupOrder) => (
              <GroupOrderCard
                key={groupOrder.id}
                groupOrder={groupOrder}
                user={user}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </MainContainer>
    </PageLayout>
  );
}