import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  };
}

interface AdminGroupOrderRowProps {
  order: GroupOrder;
  formatPrice: (price: number) => string;
  onStatusUpdate: (orderId: string, status: string, additionalData?: any) => void;
}

export function AdminGroupOrderRow({ 
  order, 
  formatPrice, 
  onStatusUpdate 
}: AdminGroupOrderRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return <Badge className="badge-warning">Collecting</Badge>;
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

  const getActionButton = () => {
    switch (order.status) {
      case "THRESHOLD_MET":
        return (
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90"
            onClick={() => onStatusUpdate(order.id, "ORDERED")}
          >
            Mark as Ordered
          </Button>
        );
      case "ORDERED":
        return (
          <Button
            size="sm"
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => onStatusUpdate(order.id, "SHIPPED")}
          >
            Mark as Shipped
          </Button>
        );
      case "SHIPPED":
        return (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              const actualDelivery = new Date().toISOString();
              onStatusUpdate(order.id, "DELIVERED", { actualDelivery });
            }}
          >
            Mark as Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getStatusBadge(order.status)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-primary">
                {order.product.name}
              </h3>
              <span className="text-sm text-muted-foreground">
                #{order.batchNumber}
              </span>
            </div>
            <div className="mt-1 flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                {formatPrice(order.currentAmount)} / {formatPrice(order.minThreshold)} 
                <span className="ml-1 font-medium text-primary">
                  ({Math.round(order.progressPercentage)}%)
                </span>
              </span>
              <span>•</span>
              <span>{order.participantCount} participants</span>
              <span>•</span>
              <span>{order.timeRemaining} days left</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getActionButton()}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/group-orders/${order.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}