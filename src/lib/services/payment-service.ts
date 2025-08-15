import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  Payment, 
  CreatePaymentIntentRequest, 
  PaymentIntent, 
  RefundRequest, 
  PaymentsResponse 
} from '@/types';

export class PaymentService {
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    try {
      const response = await apiClient.post('/api/payments/create-intent', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getPayment(id: string): Promise<Payment> {
    try {
      const response = await apiClient.get(`/api/payments/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getPaymentsByOrder(orderId: string): Promise<PaymentsResponse> {
    try {
      const response = await apiClient.get(`/api/payments?orderId=${orderId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async refundPayment(data: RefundRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/payments/refund', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10): Promise<PaymentsResponse> {
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiClient.get(`/api/payments/history?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const paymentService = new PaymentService(); 