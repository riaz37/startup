import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    icon: LucideIcon;
    title: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down" | "neutral";
    color: "primary" | "secondary" | "accent" | "success";
    description?: string;
  }[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "text-primary bg-primary/10 border-primary/20";
      case "secondary":
        return "text-secondary bg-secondary/10 border-secondary/20";
      case "accent":
        return "text-accent bg-accent/10 border-accent/20";
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50 border-green-200";
      case "down":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-muted-foreground bg-muted/50 border-muted/200";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border shadow-sm"
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Icon and Title */}
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                {stat.change && (
                  <Badge 
                    variant="outline" 
                    className={`${getTrendColor(stat.trend)} text-xs font-medium px-2 py-1`}
                  >
                    <span className="mr-1">{getTrendIcon(stat.trend)}</span>
                    {stat.change}
                  </Badge>
                )}
              </div>
              
              {/* Value and Description */}
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {stat.title}
                </p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}