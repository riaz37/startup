"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  targetAudience: string;
  scheduledAt?: string;
  status: string;
}

interface EmailTemplate {
  id: string;
  name: string;
}

interface EmailCampaignForm {
  name: string;
  description: string;
  templateId: string;
  targetAudience: string;
  scheduledAt: string;
}

interface EmailCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: EmailCampaign | null;
  templates: EmailTemplate[];
  onSubmit: (form: EmailCampaignForm) => Promise<void>;
  isSubmitting: boolean;
}

export function EmailCampaignDialog({ 
  open, 
  onOpenChange, 
  campaign, 
  templates, 
  onSubmit, 
  isSubmitting 
}: EmailCampaignDialogProps) {
  const [form, setForm] = useState<EmailCampaignForm>({
    name: "",
    description: "",
    templateId: "",
    targetAudience: "CUSTOMERS_ONLY",
    scheduledAt: ""
  });

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name,
        description: campaign.description || "",
        templateId: campaign.templateId,
        targetAudience: campaign.targetAudience,
        scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().split('T')[0] : ""
      });
    } else {
      setForm({
        name: "",
        description: "",
        templateId: "",
        targetAudience: "CUSTOMERS_ONLY",
        scheduledAt: ""
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const handleInputChange = (field: keyof EmailCampaignForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {campaign ? 'Edit Email Campaign' : 'Create Email Campaign'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name *</Label>
            <Input
              id="campaign-name"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Welcome Campaign"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-description">Description</Label>
            <Textarea
              id="campaign-description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Campaign description..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-template">Email Template *</Label>
              <Select value={form.templateId} onValueChange={(value) => handleInputChange('templateId', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-audience">Target Audience *</Label>
              <Select value={form.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_USERS">All Users</SelectItem>
                  <SelectItem value="CUSTOMERS_ONLY">Customers Only</SelectItem>
                  <SelectItem value="ADMIN_USERS">Admin Users</SelectItem>
                  <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-schedule">Schedule (Optional)</Label>
            <Input
              id="campaign-schedule"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-gray-500">
              Leave empty to send immediately or set a future date to schedule the campaign
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !form.name || !form.templateId}
            >
              {isSubmitting ? 'Saving...' : (campaign ? 'Update Campaign' : 'Create Campaign')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 