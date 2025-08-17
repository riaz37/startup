import { useQuery } from "@tanstack/react-query";

interface AdminStats {
  users: {
    total: number;
    new: number;
    growth: number;
    breakdown: Array<{ role: string; count: number }>;
  };
  orders: {
    total: number;
    active: number;
    completed: number;
    growth: number;
    breakdown: Array<{ status: string; count: number }>;
  };
  revenue: {
    total: number;
    growth: number;
    currency: string;
  };
  groupOrders: {
    total: number;
    active: number;
    completed: number;
    growth: number;
    recent: Array<{
      id: string;
      productName: string;
      status: string;
      currentQuantity: number;
      targetQuantity: number;
      participantCount: number;
      progressPercentage: number;
    }>;
  };
  products: {
    total: number;
    new: number;
    growth: number;
    topPerforming: Array<{
      productId: string;
      productName: string;
      category: string;
      revenue: number;
      quantity: number;
    }>;
  };
}

async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch('/api/admin/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch admin stats');
  }
  return response.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
} 