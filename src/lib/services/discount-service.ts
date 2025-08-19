import apiClient from '../api/api-client';

export interface DiscountConfig {
  id: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscountConfigData {
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateDiscountConfigData {
  name?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  minQuantity?: number;
  maxQuantity?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface BulkDiscountOperation {
  operation: 'activate' | 'deactivate' | 'delete';
  discountIds: string[];
}

export class DiscountService {
  async getDiscounts(): Promise<DiscountConfig[]> {
    try {
      const response = await apiClient.get('/api/admin/discounts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch discounts');
    }
  }

  async getDiscount(id: string): Promise<DiscountConfig> {
    try {
      const response = await apiClient.get(`/api/admin/discounts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch discount');
    }
  }

  async createDiscount(data: CreateDiscountConfigData): Promise<DiscountConfig> {
    try {
      const response = await apiClient.post('/api/admin/discounts', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create discount');
    }
  }

  async updateDiscount(id: string, data: UpdateDiscountConfigData): Promise<DiscountConfig> {
    try {
      const response = await apiClient.put(`/api/admin/discounts/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update discount');
    }
  }

  async deleteDiscount(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/admin/discounts/${id}`);
    } catch (error) {
      throw new Error('Failed to delete discount');
    }
  }

  async toggleDiscountStatus(id: string, isActive: boolean): Promise<DiscountConfig> {
    try {
      const response = await apiClient.patch(`/api/admin/discounts/${id}/toggle`, { isActive });
      return response.data;
    } catch (error) {
      throw new Error('Failed to toggle discount status');
    }
  }

  async bulkOperation(operation: BulkDiscountOperation): Promise<void> {
    try {
      await apiClient.post('/api/admin/discounts/bulk', operation);
    } catch (error) {
      throw new Error('Failed to perform bulk operation');
    }
  }

  async getDiscountStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
    scheduled: number;
  }> {
    try {
      const response = await apiClient.get('/api/admin/discounts/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch discount stats');
    }
  }
}

export const discountService = new DiscountService(); 