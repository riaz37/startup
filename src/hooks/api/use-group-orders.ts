'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  groupOrderService
} from '@/lib';
import { 
  GroupOrder, 
  CreateGroupOrderRequest, 
  JoinGroupOrderRequest 
} from '@/types';

// Hook for fetching all group orders
export function useGroupOrders(filters: { status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['group-orders', filters],
    queryFn: () => groupOrderService.getGroupOrders(filters),
    staleTime: 1 * 60 * 1000, // 1 minute (frequent updates)
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
}

// Hook for fetching a single group order by ID
export function useGroupOrder(id: string) {
  return useQuery({
    queryKey: ['group-order', id],
    queryFn: () => groupOrderService.getGroupOrder(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
}

// Hook for fetching active group orders
export function useActiveGroupOrders() {
  return useQuery({
    queryKey: ['group-orders', 'active'],
    queryFn: () => groupOrderService.getActiveGroupOrders(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for active orders
  });
}

// Hook for fetching group orders by product
export function useGroupOrdersByProduct(productId: string) {
  return useQuery({
    queryKey: ['group-orders', 'product', productId],
    queryFn: () => groupOrderService.getGroupOrdersByProduct(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a group order (mutation)
export function useCreateGroupOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupOrderData: CreateGroupOrderRequest) => 
      groupOrderService.createGroupOrder(groupOrderData),
    onSuccess: () => {
      // Invalidate and refetch group orders
      queryClient.invalidateQueries({ queryKey: ['group-orders'] });
      queryClient.invalidateQueries({ queryKey: ['group-orders', 'active'] });
    },
  });
}

// Hook for joining a group order (mutation)
export function useJoinGroupOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: JoinGroupOrderRequest 
    }) => groupOrderService.joinGroupOrder(id, data),
    onSuccess: (data, variables) => {
      // Invalidate group orders lists
      queryClient.invalidateQueries({ queryKey: ['group-orders'] });
      queryClient.invalidateQueries({ queryKey: ['group-orders', 'active'] });
    },
  });
}

// Hook for processing a group order (mutation)
export function useProcessGroupOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => groupOrderService.processGroupOrder(id),
    onSuccess: (data, id) => {
      // Invalidate group orders lists
      queryClient.invalidateQueries({ queryKey: ['group-orders'] });
      queryClient.invalidateQueries({ queryKey: ['group-orders', 'active'] });
    },
  });
} 