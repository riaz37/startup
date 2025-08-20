"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Mail, 
  Send, 
  Users, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  User,
  ShoppingCart,
  Clock
} from "lucide-react";
import { 
  useSendBulkEmail,
  useGetUserCount,
  useGetUsersPreview,
  useEmailTemplates
} from "@/hooks/api";
import { toast } from "sonner";

interface BulkEmailForm {
  templateId: string;
  userIds: string[];
  userFilters: {
    role: string;
    createdAfter: string;
    hasOrders: boolean;
    lastLoginAfter: string;
  };
  subject: string;
  content: string;
  scheduledAt: string;
  batchSize: number;
}

export function BulkEmailPanel() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState<BulkEmailForm>({
    templateId: "",
    userIds: [],
    userFilters: {
      role: "all",
      createdAfter: "",
      hasOrders: false,
      lastLoginAfter: ""
    },
    subject: "",
    content: "",
    scheduledAt: "",
    batchSize: 50
  });

  const [targetType, setTargetType] = useState<"specific" | "filtered">("filtered");
  const [customUserIds, setCustomUserIds] = useState("");

  // Hooks
  const { data: templates } = useEmailTemplates();
  const sendBulkEmailMutation = useSendBulkEmail();
  
  const userCountQuery = useGetUserCount(
    targetType === "filtered" ? form.userFilters : undefined
  );
  
  const usersPreviewQuery = useGetUsersPreview(
    targetType === "filtered" ? form.userFilters : undefined,
    10
  );

  // Update user count when filters change
  useEffect(() => {
    if (targetType === "filtered") {
      userCountQuery.refetch();
    }
  }, [form.userFilters, targetType]);

  const handleFilterChange = (key: keyof BulkEmailForm['userFilters'], value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      userFilters: {
        ...prev.userFilters,
        [key]: value
      }
    }));
  };

  const handleCustomUserIdsChange = (value: string) => {
    setCustomUserIds(value);
    const userIds = value
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    setForm(prev => ({
      ...prev,
      userIds
    }));
  };

  const handleSendBulkEmail = async () => {
    if (!form.subject || !form.content) {
      toast.error("Subject and content are required");
      return;
    }

    if (targetType === "specific" && form.userIds.length === 0) {
      toast.error("Please specify at least one user ID");
      return;
    }

    if (targetType === "filtered" && userCountQuery.data?.userCount === 0) {
      toast.error("No users match the selected filters");
      return;
    }

    setIsSending(true);

    try {
      const request = {
        templateId: form.templateId || undefined,
        userIds: targetType === "specific" ? form.userIds : undefined,
        userFilters: targetType === "filtered" ? form.userFilters : undefined,
        subject: form.subject,
        content: form.content,
        scheduledAt: form.scheduledAt || undefined,
        batchSize: form.batchSize
      };

      const result = await sendBulkEmailMutation.mutateAsync(request);
      
      toast.success(`Bulk email sent successfully! ${result.summary.sent} emails sent, ${result.summary.failed} failed`);
      
      // Reset form
      setForm({
        templateId: "",
        userIds: [],
        userFilters: {
          role: "",
          createdAfter: "",
          hasOrders: false,
          lastLoginAfter: ""
        },
        subject: "",
        content: "",
        scheduledAt: "",
        batchSize: 50
      });
      setCustomUserIds("");
      
    } catch (error) {
      toast.error("Failed to send bulk email");
      console.error("Bulk email error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "CUSTOMER": return "Customer";
      case "ADMIN": return "Admin";
      case "SUPER_ADMIN": return "Super Admin";
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Email Operations</h2>
          <p className="text-gray-600">Send emails to multiple users based on filters or specific user IDs</p>
        </div>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-6 w-6 text-primary mr-2" />
            Bulk Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Selection */}
          <div>
            <Label className="text-base font-medium">Target Users</Label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="filtered"
                  checked={targetType === "filtered"}
                  onChange={(e) => setTargetType(e.target.value as "filtered")}
                />
                <span>Filter by criteria</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="specific"
                  checked={targetType === "specific"}
                  onChange={(e) => setTargetType(e.target.value as "specific")}
                />
                <span>Specific user IDs</span>
              </label>
            </div>
          </div>

          {/* User Filters */}
          {targetType === "filtered" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-filter">User Role</Label>
                <Select value={form.userFilters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="created-after">Created after</Label>
                <Input
                  id="created-after"
                  type="date"
                  value={form.userFilters.createdAfter}
                  onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="last-login">Last login after</Label>
                <Input
                  id="last-login"
                  type="date"
                  value={form.userFilters.lastLoginAfter}
                  onChange={(e) => handleFilterChange('lastLoginAfter', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has-orders"
                  checked={form.userFilters.hasOrders}
                  onChange={(e) => handleFilterChange('hasOrders', e.target.checked)}
                />
                <Label htmlFor="has-orders">Has placed orders</Label>
              </div>
            </div>
          )}

          {/* Specific User IDs */}
          {targetType === "specific" && (
            <div>
              <Label htmlFor="user-ids">User IDs (comma-separated)</Label>
              <Textarea
                id="user-ids"
                placeholder="user1, user2, user3"
                value={customUserIds}
                onChange={(e) => handleCustomUserIdsChange(e.target.value)}
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter user IDs separated by commas
              </p>
            </div>
          )}

          {/* User Count Preview */}
          {targetType === "filtered" && userCountQuery.data && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  {userCountQuery.data.userCount} users match the selected criteria
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                disabled={usersPreviewQuery.isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Users
              </Button>
            </div>
          )}

          {/* Email Template */}
          <div>
            <Label htmlFor="template">Email Template (Optional)</Label>
            <Select value={form.templateId} onValueChange={(value) => setForm(prev => ({ ...prev, templateId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="No template (custom content)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No template (custom content)</SelectItem>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Subject */}
          <div>
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
            />
          </div>

          {/* Email Content */}
          <div>
            <Label htmlFor="content">Email Content (HTML) *</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="<h1>Hello {{userName}}</h1><p>This is your email content...</p>"
              rows={8}
            />
            <p className="text-sm text-gray-500 mt-1">
              Use HTML format. Available variables: {'{userName}'}, {'{userEmail}'}, {'{role}'}
            </p>
          </div>

          {/* Schedule and Batch Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled-at">Schedule (Optional)</Label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to send immediately
              </p>
            </div>

            <div>
              <Label htmlFor="batch-size">Batch Size</Label>
              <Select value={form.batchSize.toString()} onValueChange={(value) => setForm(prev => ({ ...prev, batchSize: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 emails per batch</SelectItem>
                  <SelectItem value="50">50 emails per batch</SelectItem>
                  <SelectItem value="100">100 emails per batch</SelectItem>
                  <SelectItem value="200">200 emails per batch</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Smaller batches are safer but slower
              </p>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSendBulkEmail}
              disabled={isSending || sendBulkEmailMutation.isPending}
              className="min-w-[200px]"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Bulk Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Users Preview</DialogTitle>
          </DialogHeader>
          
          {usersPreviewQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : usersPreviewQuery.data?.previewUsers ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Showing {usersPreviewQuery.data.previewUsers.length} users (up to 10 preview)
              </div>
              
              <div className="space-y-2">
                {usersPreviewQuery.data.previewUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      {user.lastLoginAt && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No users found matching the criteria
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 