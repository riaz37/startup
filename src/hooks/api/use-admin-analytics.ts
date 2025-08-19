import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    conversionRate: number;
    averageOrderValue: number;
    activeUsers: number;
    newUsers: number;
    completedOrders: number;
  };
  trends: {
    users: { date: string; count: number }[];
    orders: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
  };
  userBehavior: {
    topProducts: { productId: string; orders: number; quantity: number }[];
  };
  conversion: {
    funnel: { stage: string; count: number; conversion: number }[];
  };
}

interface UseAdminAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: (timeRange?: string) => Promise<void>;
  exportData: (format?: "csv" | "json") => Promise<void>;
}

export function useAdminAnalytics(): UseAdminAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (timeRange: string = "30d") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (format: "csv" | "json" = "csv") => {
    if (!data) {
      toast.error("No data to export");
      return;
    }

    try {
      if (format === "json") {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV export logic
        const csvContent = convertToCSV(data);
        const dataBlob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      toast.success(`Analytics data exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error("Failed to export data");
    }
  }, [data]);

  // Helper function to convert data to CSV
  const convertToCSV = (data: AnalyticsData): string => {
    const lines: string[] = [];
    
    // Overview section
    lines.push("Overview Metrics");
    lines.push("Metric,Value");
    lines.push(`Total Users,${data.overview.totalUsers}`);
    lines.push(`Total Orders,${data.overview.totalOrders}`);
    lines.push(`Total Revenue,${data.overview.totalRevenue}`);
    lines.push(`Conversion Rate,${data.overview.conversionRate}%`);
    lines.push(`Average Order Value,${data.overview.averageOrderValue}`);
    lines.push(`Active Users,${data.overview.activeUsers}`);
    lines.push(`New Users,${data.overview.newUsers}`);
    lines.push(`Completed Orders,${data.overview.completedOrders}`);
    
    lines.push(""); // Empty line for separation
    
    // Trends section
    lines.push("User Growth Trends");
    lines.push("Date,User Count");
    data.trends.users.forEach(trend => {
      lines.push(`${trend.date},${trend.count}`);
    });
    
    lines.push(""); // Empty line for separation
    
    // Conversion funnel
    lines.push("Conversion Funnel");
    lines.push("Stage,Count,Conversion Rate");
    data.conversion.funnel.forEach(stage => {
      lines.push(`${stage.stage},${stage.count},${stage.conversion}%`);
    });
    
    return lines.join("\n");
  };

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    fetchAnalytics,
    exportData,
  };
} 