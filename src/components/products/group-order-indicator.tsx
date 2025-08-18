"use client";

import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useProductGroupOrdersAvailable } from "@/hooks/api/use-group-orders";

interface GroupOrderIndicatorProps {
  productId: string;
  className?: string;
}

export function GroupOrderIndicator({ productId, className = "" }: GroupOrderIndicatorProps) {
  const { data: groupOrderData, isLoading } = useProductGroupOrdersAvailable(productId);

  if (isLoading || !groupOrderData?.hasGroupOrders) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-blue-100 text-blue-800 border-blue-200 ${className}`}
    >
      <Users className="h-3 w-3 mr-1" />
      {groupOrderData.count} Group Order{groupOrderData.count > 1 ? 's' : ''} Available
    </Badge>
  );
} 