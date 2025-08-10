import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { Activity, Package, Users, ShoppingCart, Clock } from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "order" | "group_order" | "product";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingCart;
      case "group_order":
        return Users;
      case "product":
        return Package;
      default:
        return Activity;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge className="badge-warning">Pending</Badge>;
      case "confirmed":
        return <Badge className="badge-primary">Confirmed</Badge>;
      case "delivered":
        return <Badge className="badge-success">Delivered</Badge>;
      case "cancelled":
        return <Badge className="badge-error">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-6 w-6 text-primary mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No Recent Activity"
            description="Your recent orders and group order activities will appear here."
            actionLabel="Browse Group Orders"
            actionHref="/group-orders"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-sohozdaam">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Activity className="h-6 w-6 text-primary mr-2" />
          Recent Activity
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {activity.title}
                    </p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}