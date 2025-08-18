"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHistorySkeleton } from "@/components/ui/skeleton";

interface OrderHistoryProps {
  userId: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  placedAt: string;
  groupOrder: {
    batchNumber: string;
    status: string;
    product: {
      name: string;
      imageUrl: string | null;
    };
  } | null;
  items: Array<{
    quantity: number;
  }>;
}

export default function OrderHistoryWidget({ userId }: OrderHistoryProps) {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }
        
        const data = await response.json();
        setRecentOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrderHistory();
    }
  }, [userId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return "bg-blue-100 text-blue-800";
      case "THRESHOLD_MET":
        return "bg-green-100 text-green-800";
      case "ORDERED":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="flex items-center">
            <div className="relative mr-3">
              <div className="h-5 w-5 rounded-full border-2 border-primary/20 animate-pulse"></div>
              <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            </div>
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {/* Enhanced Order Loading Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-md">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <div className="relative space-y-3">
                  {/* Header with animated elements */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-16 bg-muted/60 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                  </div>
                  
                  {/* Content with staggered animation */}
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    <div className="h-3 w-32 bg-muted/60 rounded animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                  </div>
                  
                  {/* Footer with progress indicator */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-primary/20 animate-pulse" />
                      <div className="h-3 w-16 bg-muted/40 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="relative">
                  <div className="h-3 w-3 rounded-full border-2 border-primary/20"></div>
                  <div className="absolute inset-0 h-3 w-3 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
                </div>
                <span className="animate-pulse">Loading your order history...</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-4">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h4 className="text-sm font-medium">Error loading orders</h4>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-4">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h4 className="text-sm font-medium">No orders yet</h4>
            <p className="text-sm">
              Start by joining a group order
            </p>
            <div className="mt-4">
              <Link
                href="/group-orders"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Browse Group Orders
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              {order.groupOrder?.product.imageUrl ? (
                <img
                  src={order.groupOrder.product.imageUrl}
                  alt={order.groupOrder.product.name}
                  className="h-12 w-12 object-cover rounded-lg"
                />
              ) : (
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {order.groupOrder?.product.name || 'Product not found'}
                </p>
                <p className="text-xs text-muted-foreground">
                  #{order.orderNumber} • Qty: {order.items[0]?.quantity || 0}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.groupOrder?.status || order.status)}`}>
                    {(order.groupOrder?.status || order.status).replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {formatPrice(order.totalAmount)}
                </p>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Track
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}