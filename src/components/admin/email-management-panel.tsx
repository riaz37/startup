"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  BarChart3,
  Clock,
  User
} from "lucide-react";
import { 
  useEmailStats, 
  useFailedEmails, 
  useRetryFailedEmails, 
  useTestEmailConnection 
} from "@/hooks/api";

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
  sentAt: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
}

export function EmailManagementPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<EmailDelivery[]>([]);

  // Use the new hooks
  const { data: stats, refetch: refetchStats } = useEmailStats();
  const { data: failedEmails, refetch: refetchFailedEmails } = useFailedEmails();
  const retryFailedEmailsMutation = useRetryFailedEmails();
  const testConnectionMutation = useTestEmailConnection();

  useEffect(() => {
    fetchRecentDeliveries();
  }, []);

  const fetchRecentDeliveries = async () => {
    try {
      // This would fetch recent email deliveries
      // For now, using mock data
      setRecentDeliveries([
        {
          id: '1',
          to: 'user@example.com',
          subject: 'Order Confirmed - ORD-2024-001',
          template: 'order_confirmation',
          status: 'delivered',
          sentAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
          retryCount: 0,
        },
        {
          id: '2',
          to: 'admin@example.com',
          subject: 'Payment Successful - ORD-2024-002',
          template: 'payment_success',
          status: 'sent',
          sentAt: new Date().toISOString(),
          retryCount: 0,
        },
        {
          id: '3',
          to: 'test@example.com',
          subject: 'Welcome to Sohozdaam!',
          template: 'welcome_email',
          status: 'failed',
          error: 'SMTP connection timeout',
          retryCount: 2,
        },
      ]);
    } catch (error) {
      console.error('Error fetching recent deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      },
      onError: (error) => {
        setError('Failed to retry failed emails');
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading email management data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Monitor and manage email delivery system</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={testConnectionMutation.isLoading}
          >
            <Wifi className="h-4 w-4 mr-2" />
            {testConnectionMutation.isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={retryFailedEmails}
            disabled={retryFailedEmailsMutation.isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryFailedEmailsMutation.isLoading ? 'Retrying...' : 'Retry Failed'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalDelivered.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.deliveryRate.toFixed(1)}% delivery rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalFailed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.failureRate.toFixed(1)}% failure rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageDeliveryTime.toFixed(1)}s</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="failed">Failed Emails</TabsTrigger>
          <TabsTrigger value="recent">Recent Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">SMTP Connection</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Queue Status</span>
                  </div>
                  <Badge variant="secondary">Normal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Emails</CardTitle>
            </CardHeader>
            <CardContent>
              {failedEmails && failedEmails.length > 0 ? (
                <div className="space-y-3">
                  {failedEmails.slice(0, 10).map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{email.to}</p>
                        <p className="text-sm text-muted-foreground">{email.subject}</p>
                        <p className="text-xs text-red-600">{email.error}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">Failed</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Retries: {email.retryCount}/{email.maxRetries}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p>No failed emails</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{delivery.to}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{delivery.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Template: {delivery.template}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(delivery.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(delivery.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 