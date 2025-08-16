import apiClient from '../api/api-client'
import type { SignUpInput, ForgotPasswordInput } from '@/lib/validations/auth'

// Auth API endpoints
export const authApi = {
  // Sign up
  signUp: async (data: SignUpInput) => {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordInput) => {
    const response = await apiClient.post('/auth/forgot-password', data)
    return response.data
  },

  // Reset password
  resetPassword: async (data: { token: string; password: string }) => {
    const response = await apiClient.post('/auth/reset-password', data)
    return response.data
  },

  // Resend verification email
  resendVerification: async (data: { email: string }) => {
    const response = await apiClient.post('/auth/resend-verification', data)
    return response.data
  },

  // Change password (for authenticated users)
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post('/auth/change-password', data)
    return response.data
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await apiClient.put('/auth/profile', data)
    return response.data
  },
}