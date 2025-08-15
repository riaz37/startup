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

export class EmailManagementService {
  async getEmailStats(): Promise<EmailStats> {
    try {
      const response = await apiClient.get('/api/email/management?action=stats');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getFailedEmails(): Promise<FailedEmail[]> {
    try {
      const response = await apiClient.get('/api/email/management?action=failed-emails');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async retryFailedEmails(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/email/management', { action: 'retry-failed' });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async testConnection(): Promise<TestConnectionResult> {
    try {
      const response = await apiClient.post('/api/email/management', { action: 'test-connection' });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async sendTestEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/email/management', { 
        action: 'send-test-email',
        email 
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await apiClient.get('/api/email/management?action=templates');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateEmailTemplate(id: string, data: UpdateEmailTemplateRequest): Promise<EmailTemplate> {
    try {
      const response = await apiClient.put(`/api/email/management/templates/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async toggleEmailTemplate(id: string, isActive: boolean): Promise<EmailTemplate> {
    try {
      const response = await apiClient.patch(`/api/email/management/templates/${id}/toggle`, { isActive });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const emailManagementService = new EmailManagementService(); 