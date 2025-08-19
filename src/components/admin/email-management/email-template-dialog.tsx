"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplateForm {
  name: string;
  subject: string;
  content: string;
  isActive: boolean;
}

interface EmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
  onSubmit: (form: EmailTemplateForm) => Promise<void>;
  isSubmitting: boolean;
}

export function EmailTemplateDialog({ 
  open, 
  onOpenChange, 
  template, 
  onSubmit, 
  isSubmitting 
}: EmailTemplateDialogProps) {
  const [form, setForm] = useState<EmailTemplateForm>({
    name: "",
    subject: "",
    content: "",
    isActive: true
  });

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        isActive: template.isActive
      });
    } else {
      setForm({
        name: "",
        subject: "",
        content: "",
        isActive: true
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const handleInputChange = (field: keyof EmailTemplateForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {template ? 'Edit Email Template' : 'Create Email Template'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Welcome Email"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-subject">Subject Line *</Label>
            <Input
              id="template-subject"
              value={form.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="e.g., Welcome to Sohozdaam!"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-content">Content (HTML) *</Label>
            <Textarea
              id="template-content"
              value={form.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="<h1>Welcome!</h1><p>Hello {{userName}}, welcome to Sohozdaam!</p>"
              rows={10}
              required
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Use {'{{'}variableName{'}}'} for dynamic content</span>
              <span>{form.content.length} characters</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="template-active"
              checked={form.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="template-active" className="text-sm font-medium">
              Template is active and can be used in campaigns
            </Label>
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
              disabled={isSubmitting || !form.name || !form.subject || !form.content}
            >
              {isSubmitting ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 