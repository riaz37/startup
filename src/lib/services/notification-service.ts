import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  Notification, 
  NotificationsResponse, 
  UnreadCountResponse 
} from '@/types';

export class NotificationService {
  async getNotifications(userId: string, page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiClient.get(`/api/notifications?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async markAsRead(notificationId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async markAllAsRead(userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch('/api/notifications/mark-all-read', { userId });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    try {
      const response = await apiClient.get(`/api/notifications/unread-count?userId=${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const notificationService = new NotificationService(); 