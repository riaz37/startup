import { cn } from "@/lib/utils"
import { Loader2, ShoppingCart } from "lucide-react"

interface GlobalLoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "overlay" | "page" | "inline"
  message?: string
  className?: string
}

export function GlobalLoading({ 
  size = "md", 
  variant = "default", 
  message,
  className 
}: GlobalLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  const containerClasses = {
    default: "flex items-center justify-center space-x-2",
    overlay: "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
    page: "min-h-screen flex flex-col items-center justify-center space-y-4",
    inline: "inline-flex items-center space-x-2"
  }

  if (variant === "overlay") {
    return (
      <div className={cn(containerClasses.overlay, className)}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Outer ring */}
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
            {/* Inner spinning loader */}
            <Loader2 className="h-8 w-8 text-primary animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gradient">Sohozdaam</h3>
            <p className="text-sm text-muted-foreground">
              {message || "Loading your group orders..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "page") {
    return (
      <div className={cn(containerClasses.page, className)}>
        <div className="text-center space-y-6">
          <div className="relative mx-auto">
            {/* Sohozdaam branded loader */}
            <div className="h-20 w-20 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-primary animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gradient">Sohozdaam</h2>
            <p className="text-muted-foreground max-w-md">
              {message || "Preparing your group ordering experience..."}
            </p>
          </div>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-1">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-accent rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(containerClasses[variant], className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  )
}

// Specific loading components for common use cases
export function ButtonLoading({ size = "sm", className }: { size?: "sm" | "md", className?: string }) {
  return (
    <Loader2 className={cn("animate-spin", size === "sm" ? "h-4 w-4" : "h-5 w-5", className)} />
  )
}

export function PageLoading({ message }: { message?: string }) {
  return <GlobalLoading variant="page" message={message} />
}

export function OverlayLoading({ message }: { message?: string }) {
  return <GlobalLoading variant="overlay" message={message} />
}

export function InlineLoading({ message, size = "sm" }: { message?: string, size?: "sm" | "md" | "lg" }) {
  return <GlobalLoading variant="inline" size={size} message={message} />
}