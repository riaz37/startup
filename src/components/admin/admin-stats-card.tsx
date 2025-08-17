import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AdminStatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  iconColor?: "primary" | "secondary" | "accent";
}

export function AdminStatsCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  trend,
  iconColor = "primary" 
}: AdminStatsCardProps) {
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
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${getIconColorClass(iconColor)}`} />
          </div>
          <div className="ml-4 w-0 flex-1">
            <dt className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </dt>
            <dd className="text-2xl font-bold text-foreground">
              {value}
            </dd>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                {getTrendIcon(trend)}
                <span className={`text-sm font-medium ml-1 ${getTrendColor(trend)}`}>
                  {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}