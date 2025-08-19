import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  EmailStats, 
  FailedEmail, 
  EmailTemplate, 
  UpdateEmailTemplateRequest, 
  TestConnectionResult, 
  EmailManagementResponse 
} from '@/types';

export interface BulkEmailRequest {
  templateId?: string;
  userIds?: string[];
  userFilters?: {
    role?: string;
    createdAfter?: string;
    hasOrders?: boolean;
    lastLoginAfter?: string;
  };
  subject: string;
  content: string;
  scheduledAt?: string;
  batchSize?: number;
}

export interface BulkEmailResult {
  campaignId: string;
  totalUsers: number;
  batches: Array<{
    batchNumber: number;
    users: Array<{
      userId: string;
      email: string;
      status: 'sent' | 'failed' | 'skipped';
      emailId?: string;
      error?: string;
      reason?: string;
    }>;
  }>;
  summary: {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  };
}

export interface UserPreview {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
}

export class EmailManagementService {
  async getEmailStats(): Promise<EmailStats> {
    try {
      const response = await apiClient.get('/email/management?action=stats');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getFailedEmails(): Promise<FailedEmail[]> {
    try {
      const response = await apiClient.get('/email/management?action=failed');
      const data = handleApiResponse(response);
      return data.failedEmails || [];
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async retryFailedEmails(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/email/management', { action: 'retry-failed' });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async testConnection(): Promise<TestConnectionResult> {
    try {
      const response = await apiClient.post('/email/management', { action: 'test-connection' });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async sendTestEmail(email: string, template?: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/email/management', { 
        action: 'send-test',
        email,
        template 
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await apiClient.get('/admin/email-templates');
      const data = handleApiResponse(response);
      return data.templates || [];
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getRecentDeliveries(): Promise<Array<{
    id: string;
    to: string;
    subject: string;
    template: string;
    status: string;
    sentAt?: string;
    deliveredAt?: string;
    error?: string;
    retryCount: number;
  }>> {
    try {
      const response = await apiClient.get('/email/management?action=recent-deliveries');
      const data = handleApiResponse(response);
      return data.deliveries || [];
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  // Bulk email operations
  async sendBulkEmail(request: BulkEmailRequest): Promise<BulkEmailResult> {
    try {
      const response = await apiClient.post('/email/bulk', request);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getUserCount(filters: BulkEmailRequest['userFilters']): Promise<{ userCount: number }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/email/bulk?action=user-count&${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getUsersPreview(
    filters: BulkEmailRequest['userFilters'], 
    limit: number = 10
  ): Promise<{ previewUsers: UserPreview[] }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      params.append('limit', limit.toString());
      
      const response = await apiClient.get(`/email/bulk?action=preview&${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateEmailTemplate(id: string, data: UpdateEmailTemplateRequest): Promise<EmailTemplate> {
    try {
      const response = await apiClient.put(`/admin/email-templates/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async toggleEmailTemplate(id: string, isActive: boolean): Promise<EmailTemplate> {
    try {
      const response = await apiClient.patch(`/admin/email-templates/${id}/toggle`, { isActive });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  // Email template CRUD operations
  async createEmailTemplate(templateData: {
    name: string;
    subject: string;
    content: string;
    variables: string[];
    category: string;
    isActive: boolean;
  }): Promise<EmailTemplate> {
    try {
      const response = await apiClient.post('/admin/email-templates', templateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async deleteEmailTemplate(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/admin/email-templates/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  // Email campaign operations
  async getEmailCampaigns(): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    templateId: string;
    targetAudience: string;
    scheduledAt?: string;
    status: string;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
  }>> {
    try {
      const response = await apiClient.get('/admin/email-campaigns');
      const data = handleApiResponse(response);
      return data.campaigns || [];
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async createEmailCampaign(campaignData: {
    name: string;
    description?: string;
    templateId: string;
    targetAudience: string;
    scheduledAt?: string;
  }): Promise<{ id: string; message: string }> {
    try {
      const response = await apiClient.post('/admin/email-campaigns', campaignData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateEmailCampaign(id: string, campaignData: {
    name?: string;
    description?: string;
    templateId?: string;
    targetAudience?: string;
    scheduledAt?: string;
  }): Promise<{ message: string }> {
    try {
      const response = await apiClient.put(`/admin/email-campaigns/${id}`, campaignData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async deleteEmailCampaign(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/admin/email-campaigns/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async sendEmailCampaign(id: string, options?: { testMode?: boolean; testEmail?: string }): Promise<{ message: string }> {
    try {
      const params = new URLSearchParams();
      if (options?.testMode) params.append("test", "true");
      if (options?.testEmail) params.append("testEmail", options.testEmail);
      
      const response = await apiClient.post(`/admin/email-campaigns/${id}/send?${params}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const emailManagementService = new EmailManagementService(); 