"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, User, Mail, CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";

interface EmailDelivery {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: string;
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
}

interface EmailDeliveryItemProps {
  delivery: EmailDelivery;
}

export function EmailDeliveryItem({ delivery }: EmailDeliveryItemProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'sent':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Mail,
          iconColor: 'text-blue-600'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Loader2,
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Mail,
          iconColor: 'text-gray-600'
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = getStatusConfig(delivery.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center justify-between p-5 border border-border rounded-xl hover:bg-muted/30 transition-all duration-200 group">
      <div className="flex-1 space-y-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Badge className={`${statusConfig.color} border px-3 py-1 font-medium`}>
              <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconColor}`} />
              {delivery.status}
            </Badge>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium text-foreground">{delivery.to}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="font-medium text-foreground">{delivery.subject}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-md">Template: {delivery.template}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-xs text-muted-foreground">
          {delivery.sentAt && (
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Sent: {formatDate(delivery.sentAt)}</span>
            </div>
          )}
          {delivery.deliveredAt && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Delivered: {formatDate(delivery.deliveredAt)}</span>
            </div>
          )}
          {delivery.retryCount > 0 && (
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-3 w-3 text-yellow-600" />
              <span>Retries: {delivery.retryCount}</span>
            </div>
          )}
        </div>
      </div>
      
      {delivery.error && (
        <div className="text-right max-w-xs ml-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium mb-1">Error Details</p>
            <p className="text-xs text-red-600 leading-relaxed">{delivery.error}</p>
          </div>
        </div>
      )}
    </div>
  );
} 