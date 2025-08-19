import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/api-client";

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  status: string;
  targetAudience: string;
  targetFilters?: Record<string, unknown>;
  scheduledAt?: string;
  sentAt?: string;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string;
    name: string;
    category: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    deliveries: number;
  };
}

export interface CreateEmailCampaignRequest {
  name: string;
  description?: string;
  templateId: string;
  status?: string;
  targetAudience: string;
  targetFilters?: Record<string, unknown>;
  scheduledAt?: string;
}

export interface UpdateEmailCampaignRequest {
  name?: string;
  description?: string;
  templateId?: string;
  status?: string;
  targetAudience?: string;
  targetFilters?: Record<string, unknown>;
  scheduledAt?: string;
}

export function useEmailCampaigns(status?: string, targetAudience?: string) {
  return useQuery({
    queryKey: ["email-campaigns", status, targetAudience],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (targetAudience) params.append("targetAudience", targetAudience);
      
      const response = await apiClient.get(`/admin/email-campaigns?${params}`);
      return response.data.campaigns as EmailCampaign[];
    }
  });
}

export function useEmailCampaign(id: string) {
  return useQuery({
    queryKey: ["email-campaign", id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/email-campaigns/${id}`);
      return response.data.campaign as EmailCampaign;
    },
    enabled: !!id
  });
}

export function useCreateEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEmailCampaignRequest) => {
      const response = await apiClient.post("/admin/email-campaigns", data);
      return response.data.campaign as EmailCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
    }
  });
}

export function useUpdateEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEmailCampaignRequest }) => {
      const response = await apiClient.put(`/admin/email-campaigns/${id}`, data);
      return response.data.campaign as EmailCampaign;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["email-campaign", id] });
    }
  });
}

export function useDeleteEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/email-campaigns/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
    }
  });
}

export function useSendEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, testMode, testEmail }: { 
      id: string; 
      testMode?: boolean; 
      testEmail?: string; 
    }) => {
      const params = new URLSearchParams();
      if (testMode) params.append("test", "true");
      if (testEmail) params.append("testEmail", testEmail);
      
      const response = await apiClient.post(`/admin/email-campaigns/${id}/send?${params}`);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["email-campaign", id] });
    }
  });
} 