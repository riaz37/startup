"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Target, TrendingUp, ArrowRight } from "lucide-react";
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

interface AvailableGroupOrdersProps {
  productId: string;
  productName: string;
  productUnit: string;
  productUnitSize: number;
}

export function AvailableGroupOrders({ 
  productId, 
  productName, 
  productUnit, 
  productUnitSize 
}: AvailableGroupOrdersProps) {
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroupOrders();
  }, [productId]);

  const fetchGroupOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/group-orders/product/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch group orders');
      }
      
      const data = await response.json();
      setGroupOrders(data.groupOrders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch group orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeRemaining = (days: number) => {
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    return `${days} days left`;
  };

  if (loading) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
            <div className="h-3 bg-blue-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700 text-sm">Error loading group orders: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchGroupOrders}
            className="mt-2"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (groupOrders.length === 0) {
    return null; // Don't show anything if no group orders available
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-blue-800">
          <Users className="h-5 w-5 mr-2" />
          Available Group Orders
        </CardTitle>
        <p className="text-sm text-blue-700">
          Join these group orders to get better prices and faster delivery
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupOrders.map((groupOrder) => (
          <div 
            key={groupOrder.id} 
            className="p-4 bg-white rounded-lg border border-blue-200 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {groupOrder.batchNumber}
                </Badge>
                <Badge className="bg-green-500 text-white">
                  {groupOrder.participantCount} participants
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatTimeRemaining(groupOrder.timeRemaining)}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-blue-800">
                  {groupOrder.progressPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={groupOrder.progressPercentage} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <Target className="h-3 w-3 inline mr-1" />
                  Target: {formatPrice(groupOrder.minThreshold)}
                </span>
                <span>
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Current: {formatPrice(groupOrder.currentAmount)}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Group Price</p>
                <p className="text-xl font-bold text-blue-800">
                  {formatPrice(groupOrder.pricePerUnit)} / {productUnitSize} {productUnit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Target Quantity</p>
                <p className="font-medium text-blue-800">
                  {groupOrder.targetQuantity} {productUnit}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <p>Estimated delivery: {groupOrder.estimatedDelivery 
                  ? new Date(groupOrder.estimatedDelivery).toLocaleDateString()
                  : 'TBD'
                }</p>
              </div>
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Link href={`/group-orders/${groupOrder.id}`}>
                  Join Group Order
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {/* Footer Info */}
        <div className="text-center pt-2">
          <p className="text-xs text-blue-600">
            Group orders are automatically processed when the threshold is met
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 