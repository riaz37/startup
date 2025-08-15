'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  addressService
} from '@/lib';
import { 
  Address, 
  CreateAddressRequest, 
  UpdateAddressRequest 
} from '@/types';

// Hook for fetching all addresses
export function useAddresses(userId: string) {
  return useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => addressService.getAddresses(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching a single address by ID
export function useAddress(id: string) {
  return useQuery({
    queryKey: ['address', id],
    queryFn: () => addressService.getAddress(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching default address
export function useDefaultAddress(userId: string) {
  return useQuery({
    queryKey: ['addresses', 'default', userId],
    queryFn: () => addressService.getDefaultAddress(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating an address (mutation)
export function useCreateAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressData: CreateAddressRequest) => addressService.createAddress(addressData),
    onSuccess: (data) => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: ['addresses', data.userId] });
      // Invalidate default address
      queryClient.invalidateQueries({ queryKey: ['addresses', 'default', data.userId] });
    },
  });
}

// Hook for updating an address (mutation)
export function useUpdateAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressRequest }) => 
      addressService.updateAddress(id, data),
    onSuccess: (data, variables) => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: ['addresses', data.userId] });
      // Invalidate default address
      queryClient.invalidateQueries({ queryKey: ['addresses', 'default', data.userId] });
    },
  });
}

// Hook for deleting an address (mutation)
export function useDeleteAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: (data, id) => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      // Invalidate default address
      queryClient.invalidateQueries({ queryKey: ['addresses', 'default'] });
    },
  });
}

// Hook for setting default address (mutation)
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: (data) => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      // Invalidate default address
      queryClient.invalidateQueries({ queryKey: ['addresses', 'default'] });
    },
  });
} 