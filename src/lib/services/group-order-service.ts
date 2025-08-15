import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  GroupOrder, 
  CreateGroupOrderRequest, 
  JoinGroupOrderRequest, 
  GroupOrdersResponse 
} from '@/types';

export class GroupOrderService {
  async getGroupOrders(filters: { status?: string; page?: number; limit?: number } = {}): Promise<GroupOrdersResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/group-orders?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getGroupOrder(id: string): Promise<GroupOrder> {
    try {
      const response = await apiClient.get(`/api/group-orders/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async createGroupOrder(data: CreateGroupOrderRequest): Promise<GroupOrder> {
    try {
      const response = await apiClient.post('/api/group-orders', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async joinGroupOrder(id: string, data: JoinGroupOrderRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/api/group-orders/${id}/join`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async processGroupOrder(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/api/group-orders/${id}/process`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getActiveGroupOrders(): Promise<GroupOrder[]> {
    try {
      const response = await apiClient.get('/api/group-orders?status=collecting');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getGroupOrdersByProduct(productId: string): Promise<GroupOrder[]> {
    try {
      const response = await apiClient.get(`/api/group-orders/product/${productId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const groupOrderService = new GroupOrderService(); 