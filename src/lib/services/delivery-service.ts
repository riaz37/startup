import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  Delivery, 
  DeliveryLocation, 
  CreateDeliveryRequest, 
  UpdateDeliveryRequest, 
  DeliveryStatusUpdateRequest, 
  DeliveriesResponse, 
  DeliveryLocationsResponse 
} from '@/types';

export class DeliveryService {
  async getDeliveries(filters: { status?: string; page?: number; limit?: number } = {}): Promise<DeliveriesResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/delivery?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getDelivery(id: string): Promise<Delivery> {
    try {
      const response = await apiClient.get(`/api/delivery/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getDeliveriesByOrder(orderId: string): Promise<DeliveriesResponse> {
    try {
      const response = await apiClient.get(`/api/delivery/order/${orderId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getDeliveryLocations(): Promise<DeliveryLocationsResponse> {
    try {
      const response = await apiClient.get('/api/delivery/locations');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async createDelivery(data: CreateDeliveryRequest): Promise<Delivery> {
    try {
      const response = await apiClient.post('/api/delivery', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateDelivery(id: string, data: UpdateDeliveryRequest): Promise<Delivery> {
    try {
      const response = await apiClient.put(`/api/delivery/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateDeliveryStatus(id: string, data: DeliveryStatusUpdateRequest): Promise<Delivery> {
    try {
      const response = await apiClient.patch(`/api/delivery/${id}/status`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const deliveryService = new DeliveryService(); 