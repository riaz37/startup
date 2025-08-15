import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  Address, 
  CreateAddressRequest, 
  UpdateAddressRequest, 
  AddressesResponse 
} from '@/types';

export class AddressService {
  async getAddresses(userId: string): Promise<AddressesResponse> {
    try {
      const response = await apiClient.get(`/api/addresses?userId=${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getAddress(id: string): Promise<Address> {
    try {
      const response = await apiClient.get(`/api/addresses/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    try {
      const response = await apiClient.post('/api/addresses', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateAddress(id: string, data: UpdateAddressRequest): Promise<Address> {
    try {
      const response = await apiClient.put(`/api/addresses/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async deleteAddress(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/api/addresses/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async setDefaultAddress(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch(`/api/addresses/${id}/default`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getDefaultAddress(userId: string): Promise<Address | null> {
    try {
      const response = await apiClient.get(`/api/addresses/default?userId=${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const addressService = new AddressService(); 