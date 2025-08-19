"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, RefreshCw, Plus, Mail } from "lucide-react";
import { 
  useEmailStats, 
  useFailedEmails, 
  useRetryFailedEmails, 
  useTestEmailConnection,
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  useEmailCampaigns,
  useCreateEmailCampaign,
  useUpdateEmailCampaign,
  useDeleteEmailCampaign,
  useSendEmailCampaign,
  useRecentEmailDeliveries,
  useSendTestEmail
} from "@/hooks/api";
import { toast } from "sonner";
import {
  EmailStatsGrid,
  TestEmailPanel,
  EmailDeliveryItem,
  EmailTemplateCard,
  EmailCampaignCard,
  EmailTemplateDialog,
  EmailCampaignDialog,
  FailedEmailItem,
  ActionHeader
} from "./email-management";

// Type definitions
interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  failureRate: number;
  averageDeliveryTime: number;
}

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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

interface FailedEmail {
  id: string;
  to: string;
  subject: string;
  template: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  lastAttempt: string;
}

export function EmailManagementPanel() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Template management state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  
  // Campaign management state
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);

  // Use the hooks
  const { data: stats, refetch: refetchStats } = useEmailStats();
  const { data: failedEmails, refetch: refetchFailedEmails } = useFailedEmails();
  const { data: recentDeliveries, refetch: refetchRecentDeliveries } = useRecentEmailDeliveries();
  const retryFailedEmailsMutation = useRetryFailedEmails();
  const testConnectionMutation = useTestEmailConnection();
  const sendTestEmailMutation = useSendTestEmail();
  
  // Email templates
  const { data: templates, refetch: refetchTemplates } = useEmailTemplates();
  const createTemplateMutation = useCreateEmailTemplate();
  const updateTemplateMutation = useUpdateEmailTemplate();
  const deleteTemplateMutation = useDeleteEmailTemplate();
  
  // Email campaigns
  const { data: campaigns, refetch: refetchCampaigns } = useEmailCampaigns();
  const createCampaignMutation = useCreateEmailCampaign();
  const updateCampaignMutation = useUpdateEmailCampaign();
  const deleteCampaignMutation = useDeleteEmailCampaign();
  const sendCampaignMutation = useSendEmailCampaign();

  const testConnection = async () => {
    setError(null);
    setSuccess(null);

    testConnectionMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.result.success) {
          setSuccess('SMTP connection test successful!');
        } else {
          setError('SMTP connection test failed');
        }
      },
      onError: (error) => {
        setError('An error occurred while testing connection');
      },
    });
  };

  const retryFailedEmails = async () => {
    setError(null);
    setSuccess(null);

    retryFailedEmailsMutation.mutate(undefined, {
      onSuccess: () => {
        setSuccess('Failed emails retry completed!');
        refetchFailedEmails();
        refetchStats();
        refetchRecentDeliveries();
      },
      onError: (error) => {
        setError('Failed to retry failed emails');
      },
    });
  };

  const sendTestEmail = async (email: string, template: string) => {
    setError(null);
    setSuccess(null);

    sendTestEmailMutation.mutate(
      { email, template },
      {
        onSuccess: () => {
          setSuccess('Test email sent successfully!');
          refetchRecentDeliveries();
        },
        onError: (error) => {
          setError('Failed to send test email');
        },
      }
    );
  };

  // Template management functions
  const openTemplateDialog = (template?: EmailTemplate) => {
    setEditingTemplate(template || null);
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateSubmit = async (form: Omit<EmailTemplate, 'id'>) => {
    try {
      if (editingTemplate) {
        await updateTemplateMutation.mutateAsync({
          id: editingTemplate.id,
          data: form
        });
        toast.success('Template updated successfully');
      } else {
        await createTemplateMutation.mutateAsync(form);
        toast.success('Template created successfully');
      }
      setIsTemplateDialogOpen(false);
      refetchTemplates();
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(id);
      toast.success('Template deleted successfully');
      refetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  // Campaign management functions
  const openCampaignDialog = (campaign?: EmailCampaign) => {
    setEditingCampaign(campaign || null);
    setIsCampaignDialogOpen(true);
  };

  const handleCampaignSubmit = async (form: Omit<EmailCampaign, 'id' | 'status' | 'totalSent' | 'totalDelivered' | 'totalFailed'>) => {
    try {
      if (editingCampaign) {
        await updateCampaignMutation.mutateAsync({
          id: editingCampaign.id,
          data: form
        });
        toast.success('Campaign updated successfully');
      } else {
        await createCampaignMutation.mutateAsync(form);
        toast.success('Campaign created successfully');
      }
      setIsCampaignDialogOpen(false);
      refetchCampaigns();
    } catch (error) {
      toast.error('Failed to save campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaignMutation.mutateAsync(id);
      toast.success('Campaign deleted successfully');
      refetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleSendCampaign = async (id: string, testMode = false) => {
    try {
      await sendCampaignMutation.mutateAsync({
        id,
        testMode,
        testEmail: testMode ? "test@example.com" : undefined
      });
      toast.success(testMode ? 'Test campaign sent successfully' : 'Campaign sent successfully');
      refetchCampaigns();
      refetchRecentDeliveries();
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <ActionHeader
        onTestConnection={testConnection}
        onRetryFailed={retryFailedEmails}
        isTestingConnection={testConnectionMutation.isPending}
        isRetryingFailed={retryFailedEmailsMutation.isPending}
      />

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Email Performance Overview</h2>
          <EmailStatsGrid stats={stats} />
        </div>
      )}

      {/* Test Email Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Email Testing</h2>
        <TestEmailPanel
          onSendTestEmail={sendTestEmail}
          isPending={sendTestEmailMutation.isPending}
          templates={templates}
        />
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Email Management</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              Campaigns
            </TabsTrigger>
            <TabsTrigger 
              value="failed" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              Failed Emails
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    Recent Email Deliveries
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchRecentDeliveries()}
                    className="h-9 px-4 hover:bg-primary/5 hover:border-primary transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentDeliveries && recentDeliveries.length > 0 ? (
                  <div className="space-y-3">
                    {recentDeliveries.map((delivery) => (
                      <EmailDeliveryItem key={delivery.id} delivery={delivery} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No recent email deliveries</p>
                    <p className="text-sm">Email delivery history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Email Templates</h3>
              <Button 
                onClick={() => openTemplateDialog()} 
                className="h-10 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>

            {templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <EmailTemplateCard
                    key={template.id}
                    template={template}
                    onEdit={openTemplateDialog}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium">No email templates found</p>
                <p className="text-sm mt-2">Create your first email template to get started</p>
                <Button 
                  onClick={() => openTemplateDialog()} 
                  className="mt-4 h-10 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Email Campaigns</h3>
              <Button 
                onClick={() => openCampaignDialog()} 
                className="h-10 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>

            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <EmailCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onEdit={openCampaignDialog}
                    onDelete={handleDeleteCampaign}
                    onTest={(id) => handleSendCampaign(id, true)}
                    onSend={handleSendCampaign}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium">No email campaigns found</p>
                <p className="text-sm mt-2">Create your first email campaign to reach your audience</p>
                <Button 
                  onClick={() => openCampaignDialog()} 
                  className="mt-4 h-10 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Failed Emails Tab */}
          <TabsContent value="failed" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Failed Email Deliveries</h3>
              <Button 
                onClick={() => refetchFailedEmails()} 
                className="h-10 px-6 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {failedEmails && failedEmails.length > 0 ? (
              <div className="space-y-3">
                {failedEmails.map((email) => (
                  <FailedEmailItem key={email.id} email={email} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-30" />
                <p className="text-xl font-medium">No failed emails found</p>
                <p className="text-sm mt-2">All emails are being delivered successfully</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Dialog */}
      <EmailTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        template={editingTemplate}
        onSubmit={handleTemplateSubmit}
        isSubmitting={createTemplateMutation.isPending || updateTemplateMutation.isPending}
      />

      {/* Campaign Dialog */}
      <EmailCampaignDialog
        open={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
        campaign={editingCampaign}
        templates={templates || []}
        onSubmit={handleCampaignSubmit}
        isSubmitting={createCampaignMutation.isPending || updateCampaignMutation.isPending}
      />
    </div>
  );
} 