import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, LucideIcon } from "lucide-react";

interface HelpLink {
  href: string;
  title: string;
}

interface HelpCategoryCardProps {
  icon: LucideIcon;
  title: string;
  iconColor?: "primary" | "secondary" | "accent";
  links: HelpLink[];
}

export function HelpCategoryCard({ 
  icon: Icon, 
  title, 
  iconColor = "primary", 
  links 
}: HelpCategoryCardProps) {
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
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className={`h-6 w-6 mr-2 ${getIconColorClass(iconColor)}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.map((link, index) => (
            <a 
              key={index}
              href={link.href} 
              className="flex items-center justify-between text-sm hover:text-primary transition-colors"
            >
              <span>{link.title}</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}