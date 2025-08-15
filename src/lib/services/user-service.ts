import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  User, 
  UpdateProfileRequest, 
  ChangePasswordRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  ResendVerificationRequest 
} from '@/types';

export class UserService {
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get('/api/auth/profile');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response = await apiClient.put('/api/auth/profile', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/auth/change-password', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/auth/reset-password', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async resendVerification(data: ResendVerificationRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/auth/resend-verification', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const userService = new UserService(); 