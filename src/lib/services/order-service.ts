import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  OrdersResponse 
} from '@/types';

export class OrderService {
  async getOrders(userId: string, filters: { status?: string; page?: number; limit?: number } = {}): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams({ userId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/orders?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getOrder(id: string): Promise<Order> {
    try {
      const response = await apiClient.get(`/api/orders/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post('/api/orders', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.put(`/api/orders/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async cancelOrder(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/api/orders/${id}/cancel`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getOrderHistory(userId: string, page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: limit.toString(),
        includeCompleted: 'true'
      });

      const response = await apiClient.get(`/api/orders/history?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const orderService = new OrderService(); 