import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { LazyImage } from "@/components/ui/lazy-load";

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

interface GroupOrderCardProps {
  groupOrder: GroupOrder;
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
  formatPrice: (price: number) => string;
}

export function GroupOrderCard({ groupOrder, user, formatPrice }: GroupOrderCardProps) {
  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining === 0) return 'Expires today';
    if (timeRemaining === 1) return '1 day left';
    if (timeRemaining < 7) return `${timeRemaining} days left`;
    if (timeRemaining < 30) return `${Math.floor(timeRemaining / 7)} weeks left`;
    return `${Math.floor(timeRemaining / 30)} months left`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return <Badge variant="secondary" className="text-xs">Collecting Orders</Badge>;
      case "THRESHOLD_MET":
        return <Badge variant="default" className="text-xs">Threshold Met</Badge>;
      case "ORDERED":
        return <Badge variant="secondary" className="text-xs">Ordered</Badge>;
      case "SHIPPED":
        return <Badge variant="default" className="text-xs">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="default" className="text-xs">Delivered</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <Card className="group-order-card collecting h-full flex flex-col">
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {groupOrder.product.category.name}
            </Badge>
            {getStatusBadge(groupOrder.status)}
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground">
            #{groupOrder.batchNumber}
          </span>
        </div>

        {/* Product Info */}
        <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          {groupOrder.product.imageUrl ? (
            <LazyImage
              src={groupOrder.product.imageUrl}
              alt={groupOrder.product.name}
              className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border flex-shrink-0"
            />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-muted rounded-lg flex items-center justify-center border flex-shrink-0">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold mb-1 truncate">
              {groupOrder.product.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {groupOrder.product.unitSize} {groupOrder.product.unit}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {formatPrice(groupOrder.pricePerUnit)}
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                /{groupOrder.product.unit}
              </span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress to Goal</span>
            <span className="text-primary font-semibold">
              {Math.round(groupOrder.progressPercentage)}%
            </span>
          </div>
          <div className="threshold-progress">
            <div
              className="threshold-progress-bar collecting"
              style={{ width: `${Math.min(groupOrder.progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="truncate">{formatPrice(groupOrder.currentAmount)} collected</span>
            <span className="truncate">{formatPrice(groupOrder.minThreshold)} goal</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-1" />
              <span className="text-sm sm:text-lg font-bold">{groupOrder.participantCount}</span>
            </div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-secondary mr-1" />
              <span className="text-sm sm:text-lg font-bold">{groupOrder.currentQuantity}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              of {groupOrder.targetQuantity} {groupOrder.product.unit}
            </div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg" title={`Expires on ${new Date(groupOrder.expiresAt).toLocaleDateString()} at ${new Date(groupOrder.expiresAt).toLocaleTimeString()}`}>
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-accent mr-1" />
              <span className="text-sm sm:text-lg font-bold">{groupOrder.timeRemaining}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatTimeRemaining(groupOrder.timeRemaining)}
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        {groupOrder.estimatedDelivery && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
            <div className="flex items-center text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-2 flex-shrink-0" />
              <span className="font-medium">Estimated Delivery:</span>
              <span className="ml-2">
                {new Date(groupOrder.estimatedDelivery).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 sm:space-x-3 mt-auto">
          <Button variant="outline" className="flex-1 text-xs sm:text-sm" asChild>
            <Link href={`/group-orders/${groupOrder.id}`}>
              View Details
            </Link>
          </Button>
          {user && groupOrder.status === "COLLECTING" && (
            <Button className="flex-1 text-xs sm:text-sm" asChild>
              <Link href={`/group-orders/${groupOrder.id}/join`}>
                Join Order
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}