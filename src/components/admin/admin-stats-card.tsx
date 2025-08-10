import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  iconColor?: "primary" | "secondary" | "accent";
}

export function AdminStatsCard({ 
  icon: Icon, 
  title, 
  value, 
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}