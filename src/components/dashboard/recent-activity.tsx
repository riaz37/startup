import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { Activity, Package, Users, ShoppingCart, Clock, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { RecentActivityProps } from "@/types";

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />;
      case "group_order":
        return <Users className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-primary/10 text-primary border-primary/20";
      case "group_order":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "product":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
      case "shipped":
        return "bg-primary/10 text-primary border-primary/20";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No Recent Activity"
            description="Your recent activities will appear here."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        <Button variant="outline" size="sm" asChild className="text-xs">
          <Link href="/dashboard/activity">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity) => (
            <Link key={activity.id} href={activity.href || "#"}>
              <div className="group p-4 rounded-xl border border-border hover:border-border/60 hover:bg-muted/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className={`p-2.5 rounded-lg ${getActivityColor(activity.type)} border`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                          {activity.description}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground/60 transition-colors flex-shrink-0 mt-1" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                        {activity.status && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(activity.status)}`}
                          >
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Show amount for orders or progress for group orders */}
                      {activity.type === "order" && "amount" in activity && (
                        <div className="text-sm font-semibold text-green-600">
                          ৳{(activity as any).amount?.toFixed(2) || "0.00"}
                        </div>
                      )}
                      
                      {activity.type === "group_order" && "progress" in activity && (
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-3 w-3 text-secondary" />
                          <span className="text-xs font-medium text-secondary">
                            {Math.round((activity as any).progress * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}