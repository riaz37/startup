import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HelpArticleCardProps {
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "outline";
  };
  title: string;
  description: string;
  readTime: string;
  href: string;
}

export function HelpArticleCard({ 
  badge, 
  title, 
  description, 
  readTime, 
  href 
}: HelpArticleCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        {badge && (
          <Badge variant={badge.variant || "secondary"} className="mb-3">
            {badge.text}
          </Badge>
        )}
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{readTime}</span>
          <Button variant="link" className="p-0" asChild>
            <a href={href}>Read Article →</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}