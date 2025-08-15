'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  emailManagementService
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
  return useMutation({
    mutationFn: (email: string) => emailManagementService.sendTestEmail(email),
  });
}

// Hook for updating email template (mutation)
export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplateRequest }) => 
      emailManagementService.updateEmailTemplate(id, data),
    onSuccess: (data, variables) => {
      // Invalidate email templates
      queryClient.invalidateQueries({ queryKey: ['email', 'templates'] });
    },
  });
}

// Hook for toggling email template (mutation)
export function useToggleEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      emailManagementService.toggleEmailTemplate(id, isActive),
    onSuccess: (data, variables) => {
      // Invalidate email templates
      queryClient.invalidateQueries({ queryKey: ['email', 'templates'] });
    },
  });
} 