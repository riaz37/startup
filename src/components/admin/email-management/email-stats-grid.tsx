"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  failureRate: number;
  averageDeliveryTime: number;
}

interface EmailStatsGridProps {
  stats: EmailStats;
}

export function EmailStatsGrid({ stats }: EmailStatsGridProps) {
  const statItems = [
    {
      icon: Mail,
      title: "Total Sent",
      value: (stats.totalSent || 0).toLocaleString(),
      subtitle: "Emails sent today",
      trend: 12.5,
      iconColor: "primary" as const
    },
    {
      icon: CheckCircle,
      title: "Delivered",
      value: (stats.totalDelivered || 0).toLocaleString(),
      subtitle: "Successfully delivered",
      trend: 8.2,
      iconColor: "accent" as const
    },
    {
      icon: XCircle,
      title: "Failed",
      value: (stats.totalFailed || 0).toLocaleString(),
      subtitle: "Delivery failures",
      trend: -3.1,
      iconColor: "secondary" as const
    },
    {
      icon: BarChart3,
      title: "Success Rate",
      value: `${stats.deliveryRate || 0}%`,
      subtitle: "Overall delivery success",
      trend: 2.8,
      iconColor: "primary" as const
    }
  ];

  const getIconColorClass = (color: string) => {
    switch (color) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary";
      case "accent":
        return "text-accent";
      default:
        return "text-primary";
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <Card key={item.title} className="card-hover border-0 shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className={`h-8 w-8 ${getIconColorClass(item.iconColor)}`} />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  {item.title}
                </dt>
                <dd className="text-2xl font-bold text-foreground">
                  {item.value}
                </dd>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.subtitle}
                  </p>
                )}
                {item.trend !== undefined && (
                  <div className="flex items-center mt-2">
                    {getTrendIcon(item.trend)}
                    <span className={`text-sm font-medium ml-1 ${getTrendColor(item.trend)}`}>
                      {item.trend > 0 ? '+' : ''}{item.trend.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">vs last period</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 