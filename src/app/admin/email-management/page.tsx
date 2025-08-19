import { requireAdmin } from "@/lib/auth";
import { EmailManagementPanel } from "@/components/admin/email-management-panel";
import { BulkEmailPanel } from "@/components/admin/bulk-email-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Users,
  BarChart3,
  Settings
} from "lucide-react";

export default async function EmailManagementPage() {
  const user = await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
        <p className="text-gray-600 mt-2">
          Manage email templates, campaigns, and send bulk emails to users
        </p>
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
    </div>
  );
} 