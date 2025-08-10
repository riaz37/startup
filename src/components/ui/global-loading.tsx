import { cn } from "@/lib/utils"
import { Loader2, ShoppingCart, Users, Package, Zap } from "lucide-react"

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
    overlay: "fixed inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center z-50",
    page: "min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex flex-col items-center justify-center",
    inline: "inline-flex items-center space-x-2"
  }

  if (variant === "overlay") {
    return (
      <div className={cn(containerClasses.overlay, className)}>
        <div className="flex flex-col items-center space-y-6">
          {/* Enhanced loader with multiple rings */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="h-20 w-20 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin"></div>
            {/* Middle pulsing ring */}
            <div className="absolute inset-2 h-16 w-16 rounded-full border-2 border-secondary/30 animate-pulse"></div>
            {/* Inner icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-primary animate-bounce" />
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sohozdaam
            </h3>
            <p className="text-muted-foreground max-w-sm">
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
        <div className="text-center space-y-8 max-w-md mx-auto px-4 loading-scale-in">
          {/* Enhanced main loader with custom animations */}
          <div className="relative mx-auto w-32 h-32 loading-float">
            {/* Outer ring with gradient and custom spin */}
            <div className="absolute inset-0 rounded-full loading-gradient p-1 loading-ring-spin">
              <div className="h-full w-full rounded-full bg-background"></div>
            </div>
            
            {/* Middle ring with pulse */}
            <div className="absolute inset-4 rounded-full border-2 border-primary/20 loading-pulse"></div>
            
            {/* Inner content with floating icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <ShoppingCart className="h-10 w-10 text-primary loading-bounce" />
                {/* Small floating icons with custom animations */}
                <Users className="absolute -top-2 -right-2 h-4 w-4 text-secondary loading-icon-float" />
                <Package className="absolute -bottom-2 -left-2 h-4 w-4 text-accent loading-icon-float" />
                <Zap className="absolute -top-2 -left-2 h-3 w-3 text-primary/60 loading-icon-float" />
              </div>
            </div>
          </div>
          
          {/* Brand and message with slide-up animation */}
          <div className="space-y-4 loading-slide-up">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sohozdaam
              </h1>
              <div className="h-1 w-20 loading-gradient rounded-full mx-auto"></div>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed transition-all duration-500">
              {message || "Loading your Sohozdaam experience..."}
            </p>
          </div>
          
          {/* Enhanced loading dots with custom animations */}
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          
          {/* Animated progress indicator */}
          <div className="w-full max-w-xs mx-auto">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full loading-progress rounded-full"></div>
            </div>
          </div>
          
          {/* Rotating tips */}
          <div className="text-sm text-muted-foreground/80 min-h-[1.25rem] transition-all duration-500">
            <p className="loading-slide-up">Join group orders • Save money • Build community</p>
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