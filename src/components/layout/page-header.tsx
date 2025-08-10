import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  badge?: string;
  title: string;
  highlightedWord?: string;
  description: string;
  className?: string;
}

export function PageHeader({
  badge,
  title,
  highlightedWord,
  description,
  className = "",
}: PageHeaderProps) {
  const renderTitle = () => {
    if (!highlightedWord) {
      return <span>{title}</span>;
    }

    const parts = title.split(highlightedWord);
    return (
      <>
        {parts[0]}
        <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          {highlightedWord}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className={`text-center max-w-4xl mx-auto mb-16 ${className}`}>
      {badge && (
        <Badge variant="outline" className="mb-6">
          {badge}
        </Badge>
      )}

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
        {renderTitle()}
      </h1>

      <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
