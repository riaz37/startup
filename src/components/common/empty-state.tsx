import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`card-sohozdaam text-center py-16 ${className}`}>
      <CardContent>
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        {(actionLabel && (actionHref || onAction)) && (
          <Button onClick={onAction} asChild={!!actionHref}>
            {actionHref ? (
              <a href={actionHref}>{actionLabel}</a>
            ) : (
              <span>{actionLabel}</span>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}