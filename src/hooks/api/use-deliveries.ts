'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  deliveryService
} from '@/lib';
import { 
  Delivery, 
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  DeliveryStatusUpdateRequest
} from '@/types';

// Hook for fetching deliveries with filters
export function useDeliveries(filters: { status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['deliveries', filters],
    queryFn: () => deliveryService.getDeliveries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching a single delivery by ID
export function useDelivery(id: string) {
  return useQuery({
    queryKey: ['delivery', id],
    queryFn: () => deliveryService.getDelivery(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching deliveries by order
export function useDeliveriesByOrder(orderId: string) {
  return useQuery({
    queryKey: ['deliveries', 'order', orderId],
    queryFn: () => deliveryService.getDeliveriesByOrder(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching delivery locations
export function useDeliveryLocations() {
  return useQuery({
    queryKey: ['delivery-locations'],
    queryFn: () => deliveryService.getDeliveryLocations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for creating a delivery (mutation)
export function useCreateDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (deliveryData: CreateDeliveryRequest) => deliveryService.createDelivery(deliveryData),
    onSuccess: (data) => {
      // Invalidate deliveries list
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      // Invalidate deliveries for the specific order
      queryClient.invalidateQueries({ queryKey: ['deliveries', 'order', data.orderId] });
    },
  });
}

// Hook for updating a delivery (mutation)
export function useUpdateDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliveryRequest }) => 
      deliveryService.updateDelivery(id, data),
    onSuccess: (data, variables) => {
      // Invalidate deliveries list
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      // Invalidate deliveries for the specific order
      queryClient.invalidateQueries({ queryKey: ['deliveries', 'order', data.orderId] });
    },
  });
}

// Hook for updating delivery status (mutation)
export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeliveryStatusUpdateRequest }) => 
      deliveryService.updateDeliveryStatus(id, data),
    onSuccess: (data, variables) => {
      // Invalidate deliveries list
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      // Invalidate deliveries for the specific order
      queryClient.invalidateQueries({ queryKey: ['deliveries', 'order', data.orderId] });
    },
  });
} 