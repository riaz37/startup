import { requireAdmin } from "@/lib/auth-utils";
import { MainContainer } from "@/components/layout";
import { AdminNavigation } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  BarChart3,
  TestTube
} from "lucide-react";
import { EmailManagementPanel } from "@/components/admin/email-management-panel";

export default async function EmailManagementPage() {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={user} />

      <MainContainer>
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">
              Email{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor email delivery, test the system, and manage email operations.
          </p>
        </div>

        {/* Email Management Panel */}
        <EmailManagementPanel />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-6 w-6 text-primary mr-2" />
                Test Email System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="test-template">Email Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="order-confirmation">Order Confirmation</SelectItem>
                      <SelectItem value="payment-success">Payment Success</SelectItem>
                      <SelectItem value="custom">Custom Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="h-6 w-6 text-primary mr-2" />
                System Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test SMTP Connection
                </Button>
                
                <Button variant="outline" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Retry Failed Emails
                </Button>
                
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Email Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Statistics */}
        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-6 w-6 text-primary mr-2" />
              Email Delivery Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98.5%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1,247</div>
                <div className="text-sm text-muted-foreground">Emails Sent</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">18</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">3</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
} 