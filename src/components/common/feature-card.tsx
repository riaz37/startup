import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: "primary" | "secondary" | "accent";
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = "primary",
  className = ""
}: FeatureCardProps) {
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
    <Card className={`card-hover text-center ${className}`}>
      <CardContent className="p-8">
        <Icon className={`h-12 w-12 mx-auto mb-4 ${getIconColorClass(iconColor)}`} />
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}