"use client";

import { ClientPageLayout, MainContainer } from "@/components/layout";
import { AdminNavigation } from "@/components/admin";
import { EmailManagementPanel } from "@/components/admin/email-management-panel";
import { BulkEmailPanel } from "@/components/admin/bulk-email-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Send, 
  Users,
  BarChart3,
  Settings
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function EmailManagementPage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <ClientPageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  if (!user) {
    return (
      <ClientPageLayout>
        <MainContainer>
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={{ name: user?.name || 'Admin', role: user?.role || 'ADMIN' }} />
      <MainContainer>
        {/* Clean Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mr-4">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Email Management</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Manage email templates, campaigns, and send bulk emails
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Bulk Email</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Campaigns</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EmailManagementPanel />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <BulkEmailPanel />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-6 w-6 text-primary mr-2" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Email templates are managed in the Overview tab. Use the Overview tab to create, edit, and manage your email templates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-6 w-6 text-primary mr-2" />
                  Email Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Email campaigns are managed in the Overview tab. Use the Overview tab to create, schedule, and manage your email campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </MainContainer>
    </div>
  );
} 