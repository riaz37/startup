"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, TestTube, Mail, Zap } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
}

interface TestEmailPanelProps {
  onSendTestEmail: (email: string, template: string) => Promise<void>;
  isPending: boolean;
  templates?: EmailTemplate[];
}

export function TestEmailPanel({ onSendTestEmail, isPending, templates }: TestEmailPanelProps) {
  const [testEmail, setTestEmail] = useState("");
  const [testTemplate, setTestTemplate] = useState("");

  const handleSendTestEmail = async () => {
    if (!testEmail || !testTemplate) return;
    await onSendTestEmail(testEmail, testTemplate);
    setTestEmail("");
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center text-xl font-semibold">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 mr-3">
            <TestTube className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-foreground">Test Email System</span>
            <p className="text-sm font-normal text-muted-foreground mt-1">
              Send test emails to verify your email configuration
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="test-email" className="text-sm font-medium text-foreground">
              <Mail className="h-4 w-4 inline mr-2 text-muted-foreground" />
              Test Email Address
            </Label>
            <Input
              id="test-email"
              type="email"
              placeholder="Enter email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="h-11 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="test-template" className="text-sm font-medium text-foreground">
              <Zap className="h-4 w-4 inline mr-2 text-muted-foreground" />
              Email Template
            </Label>
            <Select value={testTemplate} onValueChange={setTestTemplate}>
              <SelectTrigger className="h-11 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates && templates.length > 0 ? (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-templates" disabled>
                    No templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleSendTestEmail} 
              disabled={isPending || !testEmail || !testTemplate || testTemplate === "no-templates"}
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </div>
        
        {templates && templates.length === 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
            <div className="text-center text-sm text-muted-foreground">
              <Mail className="h-5 w-5 mx-auto mb-2 opacity-50" />
              <p>No email templates available. Create a template first to test the email system.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 