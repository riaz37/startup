'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/lib';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '@/types';

// Hook for fetching all orders
export function useOrders(userId: string, filters: { status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['orders', userId, filters],
    queryFn: () => orderService.getOrders(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching a single order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching order history
export function useOrderHistory(userId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['orders', 'history', userId, page, limit],
    queryFn: () => orderService.getOrderHistory(userId, page, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating an order (mutation)
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => orderService.createOrder(orderData),
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'history'] });
    },
  });
}

// Hook for updating an order (mutation)
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) => 
      orderService.updateOrder(id, data),
    onSuccess: (data, variables) => {
      // Update the specific order in cache
      queryClient.setQueryData(['order', variables.id], data);
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'history'] });
    },
  });
}

// Hook for cancelling an order (mutation)
export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => orderService.cancelOrder(id),
    onSuccess: (_, id) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'history'] });
    },
  });
} 