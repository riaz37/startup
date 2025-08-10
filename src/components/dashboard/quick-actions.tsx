import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickAction {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: "primary" | "secondary" | "accent";
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const getButtonVariant = (color: string) => {
    switch (color) {
      case "primary":
        return "default";
      case "secondary":
        return "secondary";
      case "accent":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card className="card-sohozdaam">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={getButtonVariant(action.color) as any}
              className="h-auto p-4 flex flex-col items-center space-y-2"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}