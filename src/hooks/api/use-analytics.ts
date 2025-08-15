'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  analyticsService
} from '@/lib';
import { 
  DashboardAnalytics, 
  SalesMetrics, 
  UserMetrics, 
  OrderMetrics, 
  GroupOrderMetrics, 
  RevenueMetrics, 
  AnalyticsFilters,
  ExportFormat
} from '@/types';

// Hook for fetching dashboard analytics
export function useDashboardAnalytics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => analyticsService.getDashboardAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching sales metrics
export function useSalesMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'sales', filters],
    queryFn: () => analyticsService.getSalesMetrics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for fetching user metrics
export function useUserMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'users', filters],
    queryFn: () => analyticsService.getUserMetrics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for fetching order metrics
export function useOrderMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'orders', filters],
    queryFn: () => analyticsService.getOrderMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching group order metrics
export function useGroupOrderMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'group-orders', filters],
    queryFn: () => analyticsService.getGroupOrderMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching revenue metrics
export function useRevenueMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'revenue', filters],
    queryFn: () => analyticsService.getRevenueMetrics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for exporting analytics data
export function useExportAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'export'],
    queryFn: ({ queryKey }: { queryKey: readonly unknown[] }) => {
      const [_, __, filters, format] = queryKey;
      return analyticsService.exportAnalytics(format as ExportFormat);
    },
    enabled: false, // This should be called manually
    staleTime: 0, // Don't cache exports
    gcTime: 0,
  });
} 