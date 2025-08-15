'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  paymentService
} from '@/lib';
import { 
  Payment, 
  PaymentIntent, 
  CreatePaymentIntentRequest, 
  RefundRequest 
} from '@/types';

// Hook for fetching payment by ID
export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPayment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching payments by order
export function usePaymentsByOrder(orderId: string) {
  return useQuery({
    queryKey: ['payments', 'order', orderId],
    queryFn: () => paymentService.getPaymentsByOrder(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching payment history
export function usePaymentHistory(userId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['payments', 'history', userId, page, limit],
    queryFn: () => paymentService.getPaymentHistory(userId, page, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating a payment intent (mutation)
export function useCreatePaymentIntent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentData: CreatePaymentIntentRequest) => 
      paymentService.createPaymentIntent(paymentData),
    onSuccess: (data, variables) => {
      // Invalidate payments for the specific order
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'order', variables.orderId] 
      });
      // Invalidate payment history
      queryClient.invalidateQueries({ queryKey: ['payments', 'history'] });
    },
  });
}

// Hook for refunding a payment (mutation)
export function useRefundPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (refundData: RefundRequest) => paymentService.refundPayment(refundData),
    onSuccess: (data, refundData) => {
      // Invalidate payments for the order
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'order', refundData.paymentId] 
      });
      // Invalidate payment history
      queryClient.invalidateQueries({ queryKey: ['payments', 'history'] });
    },
  });
} 