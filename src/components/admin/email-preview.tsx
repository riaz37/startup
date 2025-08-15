"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  createVerificationEmailTemplate, 
  createPasswordResetEmailTemplate, 
  createWelcomeEmailTemplate 
} from "@/lib/email-templates";

export function EmailPreview() {
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john@example.com");
  const [previewHtml, setPreviewHtml] = useState("");
  const [activeTemplate, setActiveTemplate] = useState("verification");

  const generatePreview = (templateType: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const sampleToken = "sample-token-123";
    
    let html = "";
    
    switch (templateType) {
      case "verification":
        html = createVerificationEmailTemplate(`${baseUrl}/api/auth/verify-email?token=${sampleToken}`, userName);
        break;
      case "password-reset":
        html = createPasswordResetEmailTemplate(`${baseUrl}/auth/reset-password?token=${sampleToken}`, userName);
        break;
      case "welcome":
        html = createWelcomeEmailTemplate(`${baseUrl}/dashboard`, userName);
        break;
      default:
        html = "";
    }
    
    setPreviewHtml(html);
    setActiveTemplate(templateType);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Template Preview</CardTitle>
          <CardDescription>
            Preview how your authentication emails will look to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userName">User Name</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter user email"
              />
            </div>
          </div>

          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verification">Email Verification</TabsTrigger>
              <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
              <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="verification" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Email Verification Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Sent when users sign up to verify their email address
                  </p>
                </div>
                <Button onClick={() => generatePreview("verification")}>
                  Generate Preview
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="password-reset" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Password Reset Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Sent when users request to reset their password
                  </p>
                </div>
                <Button onClick={() => generatePreview("password-reset")}>
                  Generate Preview
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="welcome" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Welcome Email Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Sent after users successfully verify their email
                  </p>
                </div>
                <Button onClick={() => generatePreview("welcome")}>
                  Generate Preview
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {previewHtml && (
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>
              This is how the {activeTemplate.replace("-", " ")} email will appear to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="w-full h-96 overflow-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([previewHtml], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${activeTemplate}-email-template.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download HTML
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(previewHtml);
                }}
              >
                Copy HTML
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}