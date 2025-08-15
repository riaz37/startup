"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  notificationService
} from '@/lib';
import { 
  Notification, 
  NotificationsResponse
} from '@/types';

// Hook for fetching notifications with filters
export function useNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: ["notifications", userId, page, limit],
    queryFn: () => notificationService.getNotifications(userId, page, limit),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute (frequent updates)
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
}

// Hook for fetching unread notifications count
export function useUnreadNotificationsCount(userId: string) {
  return useQuery({
    queryKey: ["notifications", "unread-count", userId],
    queryFn: () => notificationService.getUnreadCount(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Hook for marking a notification as read (mutation)
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (data, id) => {
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
}

// Hook for marking all notifications as read (mutation)
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationService.markAllAsRead(userId),
    onSuccess: (data, userId) => {
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count", userId],
      });
    },
  });
}
