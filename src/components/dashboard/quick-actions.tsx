import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickAction {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: "primary" | "secondary" | "accent" | "success";
  badge?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10";
      case "secondary":
        return "bg-secondary/5 text-secondary border-secondary/20 hover:bg-secondary/10";
      case "accent":
        return "bg-accent/5 text-accent border-accent/20 hover:bg-accent/10";
      case "success":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      default:
        return "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary";
      case "accent":
        return "text-accent";
      case "success":
        return "text-green-600";
      default:
        return "text-primary";
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Access your most used features</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer ${getColorClasses(action.color)}`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-background/80 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-6 w-6 ${getIconColor(action.color)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                        {action.title}
                      </h3>
                      {action.badge && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-background/80 border-current"
                        >
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                      {action.description}
                    </p>
                  </div>
                  <div className="text-muted-foreground group-hover:text-foreground/60 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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