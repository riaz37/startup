"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  TestTube,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface EmailStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
  successRate: number;
}

interface EmailDelivery {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
}

export function EmailManagementPanel() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<EmailDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isRetryingFailed, setIsRetryingFailed] = useState(false);

  useEffect(() => {
    fetchEmailStats();
    fetchRecentDeliveries();
  }, []);

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/email/management?action=stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

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
    setIsTestingConnection(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/email/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result.success) {
          setSuccess('SMTP connection test successful!');
        } else {
          setError('SMTP connection test failed');
        }
      } else {
        setError('Failed to test connection');
      }
    } catch (error) {
      setError('An error occurred while testing connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const retryFailedEmails = async () => {
    setIsRetryingFailed(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/email/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry-failed' }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Retry completed. ${data.results.length} emails processed.`);
        // Refresh stats
        await fetchEmailStats();
      } else {
        setError('Failed to retry failed emails');
      }
    } catch (error) {
      setError('An error occurred while retrying failed emails');
    } finally {
      setIsRetryingFailed(false);
    }
  };

  const sendTestEmail = async () => {
    // Implementation for sending test email
    setSuccess('Test email functionality would be implemented here');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary", text: "Pending" },
      sent: { variant: "default", text: "Sent" },
      delivered: { variant: "default", text: "Delivered" },
      failed: { variant: "destructive", text: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", text: status };
    
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="card-sohozdaam mb-8">
        <CardContent className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading email management data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Status Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Email Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Emails</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats?.successRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{stats?.failed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate Progress */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle>Email Delivery Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Current Success Rate</span>
              <span className="font-medium">{stats?.successRate || 0}%</span>
            </div>
            <Progress value={stats?.successRate || 0} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Email Deliveries */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Email Deliveries</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecentDeliveries}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(delivery.status)}
                  <div>
                    <p className="font-medium text-sm">{delivery.to}</p>
                    <p className="text-xs text-muted-foreground">
                      {delivery.subject}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(delivery.status)}
                  
                  {delivery.status === 'failed' && (
                    <Badge variant="outline" className="text-xs">
                      Retry: {delivery.retryCount}/3
                    </Badge>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {delivery.sentAt ? new Date(delivery.sentAt).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="h-6 w-6 text-primary mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                {isTestingConnection ? 'Testing...' : 'Test SMTP Connection'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={retryFailedEmails}
                disabled={isRetryingFailed}
              >
                {isRetryingFailed ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isRetryingFailed ? 'Retrying...' : 'Retry Failed Emails'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-6 w-6 text-primary mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Average Delivery Time</span>
                <span className="text-sm font-medium">2.3s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Bounce Rate</span>
                <span className="text-sm font-medium">0.5%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Spam Complaints</span>
                <span className="text-sm font-medium">0</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Unsubscribe Rate</span>
                <span className="text-sm font-medium">0.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 