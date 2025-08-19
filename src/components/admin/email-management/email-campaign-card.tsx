"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Send, Calendar, Users } from "lucide-react";

interface EmailCampaign {
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
}

interface EmailCampaignCardProps {
  campaign: EmailCampaign;
  onEdit: (campaign: EmailCampaign) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onSend: (id: string) => void;
}

export function EmailCampaignCard({ campaign, onEdit, onDelete, onTest, onSend }: EmailCampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED':
        return 'bg-purple-100 text-purple-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'ALL_USERS':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMERS_ONLY':
        return 'bg-green-100 text-green-800';
      case 'ADMIN_USERS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {campaign.name}
            </CardTitle>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status.replace('_', ' ')}
              </Badge>
              <Badge className={getAudienceColor(campaign.targetAudience)}>
                {campaign.targetAudience.replace('_', ' ')}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-sm text-gray-600">{campaign.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Target</p>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Users className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium">{campaign.targetAudience.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Sent</p>
            <p className="text-sm font-medium text-blue-600">{campaign.totalSent}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="text-sm font-medium text-green-600">{campaign.totalDelivered}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Failed</p>
            <p className="text-sm font-medium text-red-600">{campaign.totalFailed}</p>
          </div>
        </div>

        {campaign.scheduledAt && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Calendar className="h-4 w-4" />
            <span>Scheduled for: {formatDate(campaign.scheduledAt)}</span>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(campaign.id)}
            className="h-8 px-3"
          >
            <Eye className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(campaign)}
            className="h-8 px-3"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {campaign.status === 'DRAFT' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSend(campaign.id)}
              className="h-8 px-3"
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(campaign.id)}
            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 