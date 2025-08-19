'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  emailManagementService,
  BulkEmailRequest,
  BulkEmailResult,
  UserPreview
} from '@/lib';
import { 
  EmailStats, 
  EmailTemplate, 
  FailedEmail, 
  UpdateEmailTemplateRequest
} from '@/types';

// Hook for fetching email stats
export function useEmailStats() {
  return useQuery({
    queryKey: ['email', 'stats'],
    queryFn: () => emailManagementService.getEmailStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching failed emails
export function useFailedEmails() {
  return useQuery({
    queryKey: ['email', 'failed'],
    queryFn: () => emailManagementService.getFailedEmails(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching email templates
export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email', 'templates'],
    queryFn: () => emailManagementService.getEmailTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for fetching recent email deliveries
export function useRecentEmailDeliveries() {
  return useQuery({
    queryKey: ['email', 'recent-deliveries'],
    queryFn: () => emailManagementService.getRecentDeliveries(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for retrying failed emails (mutation)
export function useRetryFailedEmails() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => emailManagementService.retryFailedEmails(),
    onSuccess: () => {
      // Invalidate failed emails list
      queryClient.invalidateQueries({ queryKey: ['email', 'failed'] });
      // Invalidate email stats
      queryClient.invalidateQueries({ queryKey: ['email', 'stats'] });
      // Invalidate recent deliveries
      queryClient.invalidateQueries({ queryKey: ['email', 'recent-deliveries'] });
    },
  });
}

// Hook for testing email connection (mutation)
export function useTestEmailConnection() {
  return useMutation({
    mutationFn: () => emailManagementService.testConnection(),
  });
}

// Hook for sending test email (mutation)
export function useSendTestEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, template }: { email: string; template?: string }) => 
      emailManagementService.sendTestEmail(email, template),
    onSuccess: () => {
      // Invalidate recent deliveries to show the test email
      queryClient.invalidateQueries({ queryKey: ['email', 'recent-deliveries'] });
    },
  });
}

// Bulk email hooks
export function useSendBulkEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BulkEmailRequest) => emailManagementService.sendBulkEmail(request),
    onSuccess: () => {
      // Invalidate email campaigns
      queryClient.invalidateQueries({ queryKey: ['email', 'campaigns'] });
      // Invalidate recent deliveries
      queryClient.invalidateQueries({ queryKey: ['email', 'recent-deliveries'] });
      // Invalidate email stats
      queryClient.invalidateQueries({ queryKey: ['email', 'stats'] });
    },
  });
}

export function useGetUserCount(filters: BulkEmailRequest['userFilters']) {
  return useQuery({
    queryKey: ['email', 'user-count', filters],
    queryFn: () => emailManagementService.getUserCount(filters),
    enabled: !!filters,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGetUsersPreview(
  filters: BulkEmailRequest['userFilters'], 
  limit: number = 10
) {
  return useQuery({
    queryKey: ['email', 'users-preview', filters, limit],
    queryFn: () => emailManagementService.getUsersPreview(filters, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Email template CRUD hooks
export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      subject: string;
      content: string;
      variables: string[];
      category: string;
      isActive: boolean;
    }) => emailManagementService.createEmailTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'templates'] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      name?: string;
      subject?: string;
      content?: string;
      variables?: string[];
      category?: string;
      isActive?: boolean;
    } }) => 
      emailManagementService.updateEmailTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'templates'] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => emailManagementService.deleteEmailTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'templates'] });
    },
  });
}

export function useToggleEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      emailManagementService.toggleEmailTemplate(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'templates'] });
    },
  });
}

// Email campaign hooks
export function useEmailCampaigns() {
  return useQuery({
    queryKey: ['email', 'campaigns'],
    queryFn: () => emailManagementService.getEmailCampaigns(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      templateId: string;
      targetAudience: string;
      scheduledAt?: string;
    }) => emailManagementService.createEmailCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'campaigns'] });
    },
  });
}

export function useUpdateEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      name?: string;
      description?: string;
      templateId?: string;
      targetAudience?: string;
      scheduledAt?: string;
    } }) => 
      emailManagementService.updateEmailCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'campaigns'] });
    },
  });
}

export function useDeleteEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => emailManagementService.deleteEmailCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'campaigns'] });
    },
  });
}

export function useSendEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, testMode, testEmail }: { 
      id: string; 
      testMode?: boolean; 
      testEmail?: string; 
    }) => emailManagementService.sendEmailCampaign(id, { testMode, testEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['email', 'recent-deliveries'] });
    },
  });
} 