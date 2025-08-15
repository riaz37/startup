import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  DashboardAnalytics, 
  SalesMetrics, 
  UserMetrics, 
  OrderMetrics, 
  GroupOrderMetrics, 
  RevenueMetrics, 
  AnalyticsFilters, 
  ExportFormat 
} from '@/types';

export class AnalyticsService {
  async getDashboardAnalytics(filters: AnalyticsFilters = {}): Promise<DashboardAnalytics> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/analytics/dashboard?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getSalesMetrics(filters: AnalyticsFilters = {}): Promise<SalesMetrics> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/analytics/sales?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getUserMetrics(filters: AnalyticsFilters = {}): Promise<UserMetrics> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/analytics/users?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getOrderMetrics(filters: AnalyticsFilters = {}): Promise<OrderMetrics> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/analytics/orders?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getGroupOrderMetrics(filters: AnalyticsFilters = {}): Promise<GroupOrderMetrics> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/analytics/group-orders?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getRevenueMetrics(filters: AnalyticsFilters = {}): Promise<RevenueMetrics> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/analytics/revenue?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async exportAnalytics(format: ExportFormat): Promise<Blob> {
    try {
      const response = await apiClient.post('/api/analytics/export', format, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const analyticsService = new AnalyticsService(); 