import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib/database";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Package, TrendingUp, ArrowLeft } from "lucide-react";
import { PriceHistoryWrapper } from "@/components/products/price-history-wrapper";

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
    description: string | null;
    mrp: number;
    sellingPrice: number;
    category: {
      name: string;
    };
  };
  orders: Array<{
    id: string;
    totalAmount: number;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
}

async function getGroupOrder(id: string): Promise<GroupOrder | null> {
  try {
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        orders: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            items: {
              select: {
                quantity: true,
                unitPrice: true,
                totalPrice: true,
              },
            },
          },
        },
      },
    });

    if (!groupOrder) {
      return null;
    }

    // Calculate derived fields
    const currentAmount = groupOrder.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const currentQuantity = groupOrder.orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const pricePerUnit = currentQuantity > 0 ? currentAmount / currentQuantity : 0;
    const progressPercentage = groupOrder.targetQuantity > 0 
      ? Math.min((currentQuantity / groupOrder.targetQuantity) * 100, 100)
      : 0;
    
    // Calculate time remaining using the same logic as the main page
    const timeRemaining = (() => {
      const now = new Date();
      const expiresAt = groupOrder.expiresAt;
      
      // Set both dates to start of day for consistent day calculation
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfExpiry = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
      
      // Calculate the difference in days
      const diffTime = startOfExpiry.getTime() - startOfToday.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 0) return 0; // Expired or expires today
      
      return Math.round(diffDays);
    })();

    return {
      id: groupOrder.id,
      batchNumber: groupOrder.batchNumber,
      minThreshold: groupOrder.minThreshold,
      currentAmount,
      targetQuantity: groupOrder.targetQuantity,
      currentQuantity,
      pricePerUnit,
      status: groupOrder.status,
      expiresAt: groupOrder.expiresAt.toISOString(),
      estimatedDelivery: groupOrder.estimatedDelivery?.toISOString() || null,
      progressPercentage,
      participantCount: groupOrder.orders.length,
      timeRemaining,
      product: {
        id: groupOrder.product.id,
        name: groupOrder.product.name,
        unit: groupOrder.product.unit,
        unitSize: groupOrder.product.unitSize,
        imageUrl: groupOrder.product.imageUrl,
        description: groupOrder.product.description,
        mrp: groupOrder.product.mrp,
        sellingPrice: groupOrder.product.sellingPrice,
        category: {
          name: groupOrder.product.category.name,
        },
      },
      orders: groupOrder.orders.map((order) => ({
        id: order.id,
        totalAmount: order.totalAmount,
        user: {
          name: order.user.name,
          email: order.user.email,
        },
        items: order.items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching group order:", error);
    return null;
  }
}

export default async function GroupOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const groupOrder = await getGroupOrder(id);

  if (!groupOrder) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
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

  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining === 0) return 'Expires today';
    if (timeRemaining === 1) return '1 day left';
    if (timeRemaining < 7) return `${timeRemaining} days left`;
    if (timeRemaining < 30) return `${Math.floor(timeRemaining / 7)} weeks left`;
    return `${Math.floor(timeRemaining / 30)} months left`;
  };

  const userHasJoined = user && groupOrder.orders.some(order => order.user.email === user.email);

  return (
    <PageLayout>
      <MainContainer>
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/group-orders" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Group Orders
          </Link>
        </div>

        {/* Page Header */}
        <PageHeader
          badge={`#${groupOrder.batchNumber}`}
          title={groupOrder.product.name}
          highlightedWord={groupOrder.product.name}
          description={`Group order for ${groupOrder.product.unitSize} ${groupOrder.product.unit} units at bulk pricing`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            {groupOrder.product.imageUrl ? (
              <img
                src={groupOrder.product.imageUrl}
                alt={groupOrder.product.name}
                className="w-full h-96 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center border">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Group Order Info */}
          <div className="space-y-6">
            {/* Status and Category */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {groupOrder.product.category.name}
              </Badge>
              {getStatusBadge(groupOrder.status)}
            </div>

            {/* Product Details */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {groupOrder.product.unitSize} {groupOrder.product.unit} per unit
              </p>
              {groupOrder.product.description && (
                <p className="text-muted-foreground">
                  {groupOrder.product.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(groupOrder.pricePerUnit)}
                </span>
                <span className="text-muted-foreground">
                  per {groupOrder.product.unit}
                </span>
              </div>
              <p className="text-sm text-green-600 font-medium">
                🎉 Bulk pricing - Save with group orders!
              </p>
            </div>

            {/* Price History Display */}
            <div className="mt-4">
              <PriceHistoryWrapper
                productId={groupOrder.product.id}
                currentMrp={groupOrder.product.mrp}
                currentSellingPrice={groupOrder.product.sellingPrice}
              />
            </div>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress to Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-primary">
                    {Math.round(groupOrder.progressPercentage)}%
                  </span>
                </div>
                <Progress value={groupOrder.progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(groupOrder.currentAmount)} collected</span>
                  <span>{formatPrice(groupOrder.minThreshold)} goal</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <span className="text-xl font-bold">{groupOrder.participantCount}</span>
                </div>
                <div className="text-xs text-muted-foreground">Participants</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-secondary mr-2" />
                  <span className="text-xl font-bold">{groupOrder.currentQuantity}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  of {groupOrder.targetQuantity} {groupOrder.product.unit}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-accent mr-2" />
                  <span className="text-xl font-bold">{groupOrder.timeRemaining}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimeRemaining(groupOrder.timeRemaining)}
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {groupOrder.estimatedDelivery && (
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Delivery Information</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Estimated delivery: {new Date(groupOrder.estimatedDelivery).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Delivery date may vary based on order fulfillment
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {user ? (
                userHasJoined ? (
                  <div className="w-full bg-green-100 border border-green-200 rounded-md py-3 px-6 flex items-center justify-center text-base font-medium text-green-800">
                    ✓ You&apos;ve joined this group order
                  </div>
                ) : groupOrder.status === "COLLECTING" ? (
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/group-orders/${groupOrder.id}/join`}>
                      Join Group Order
                    </Link>
                  </Button>
                ) : (
                  <div className="w-full bg-muted border border-border rounded-md py-3 px-6 flex items-center justify-center text-base font-medium text-muted-foreground">
                    Order no longer accepting participants
                  </div>
                )
              ) : (
                <Button asChild className="w-full" size="lg">
                  <Link href="/auth/signin">
                    Sign in to Join
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Participants Section */}
        {groupOrder.orders.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Participants ({groupOrder.participantCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupOrder.orders.map((order, index) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {order.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {order.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ordered {order.items[0]?.quantity || 0} {groupOrder.product.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </MainContainer>
    </PageLayout>
  );
}