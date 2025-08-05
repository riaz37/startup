import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home, ArrowLeft, Bug, Wifi, Server } from "lucide-react"
import Link from "next/link"

interface GlobalErrorProps {
  variant?: "page" | "card" | "inline" | "overlay"
  title?: string
  message?: string
  errorCode?: string
  showRetry?: boolean
  showHome?: boolean
  showBack?: boolean
  onRetry?: () => void
  onBack?: () => void
  className?: string
  children?: React.ReactNode
}

const errorTypes = {
  network: {
    icon: Wifi,
    title: "Connection Problem",
    message: "Please check your internet connection and try again.",
    color: "text-amber-500"
  },
  server: {
    icon: Server,
    title: "Server Error",
    message: "Our servers are experiencing issues. Please try again later.",
    color: "text-red-500"
  },
  notFound: {
    icon: AlertCircle,
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist or has been moved.",
    color: "text-blue-500"
  },
  unauthorized: {
    icon: AlertCircle,
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    color: "text-orange-500"
  },
  generic: {
    icon: Bug,
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    color: "text-destructive"
  }
}

export function GlobalError({
  variant = "page",
  title,
  message,
  errorCode,
  showRetry = true,
  showHome = true,
  showBack = false,
  onRetry,
  onBack,
  className,
  children
}: GlobalErrorProps) {
  // Determine error type based on error code or use generic
  const getErrorType = () => {
    if (errorCode?.includes("NETWORK") || errorCode?.includes("FETCH")) return errorTypes.network
    if (errorCode?.includes("500") || errorCode?.includes("SERVER")) return errorTypes.server
    if (errorCode?.includes("404") || errorCode?.includes("NOT_FOUND")) return errorTypes.notFound
    if (errorCode?.includes("401") || errorCode?.includes("403") || errorCode?.includes("UNAUTHORIZED")) return errorTypes.unauthorized
    return errorTypes.generic
  }

  const errorType = getErrorType()
  const IconComponent = errorType.icon

  const defaultRetry = () => {
    window.location.reload()
  }

  const defaultBack = () => {
    window.history.back()
  }

  if (variant === "overlay") {
    return (
      <div className={cn("fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50", className)}>
        <div className="max-w-md mx-4">
          <div className="card-sohozdaam text-center space-y-6">
            <div className={cn("mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10")}>
              <IconComponent className={cn("h-8 w-8", errorType.color)} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{title || errorType.title}</h3>
              <p className="text-sm text-muted-foreground">{message || errorType.message}</p>
              {errorCode && (
                <p className="text-xs text-muted-foreground font-mono">Error: {errorCode}</p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              {showRetry && (
                <Button onClick={onRetry || defaultRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              {showBack && (
                <Button variant="outline" onClick={onBack || defaultBack} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "page") {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-4", className)}>
        <div className="max-w-md text-center space-y-8">
          {/* Sohozdaam branding */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-gradient">Sohozdaam</h1>
            </Link>
          </div>

          {/* Error illustration */}
          <div className="relative">
            <div className={cn("mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10")}>
              <IconComponent className={cn("h-10 w-10", errorType.color)} />
            </div>
          </div>
          
          {/* Error content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">{title || errorType.title}</h2>
            <p className="text-muted-foreground">{message || errorType.message}</p>
            {errorCode && (
              <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                Error Code: {errorCode}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetry && (
              <Button onClick={onRetry || defaultRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {showHome && (
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            )}
            {showBack && (
              <Button variant="outline" onClick={onBack || defaultBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}
          </div>

          {/* Additional content */}
          {children}

          {/* Help link */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link href="/contact" className="text-primary hover:text-primary/80 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div className={cn("card-sohozdaam text-center space-y-4", className)}>
        <div className={cn("mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10")}>
          <IconComponent className={cn("h-6 w-6", errorType.color)} />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold">{title || errorType.title}</h3>
          <p className="text-sm text-muted-foreground">{message || errorType.message}</p>
          {errorCode && (
            <p className="text-xs text-muted-foreground font-mono">Error: {errorCode}</p>
          )}
        </div>

        {(showRetry || showBack) && (
          <div className="flex flex-col space-y-2">
            {showRetry && (
              <Button size="sm" onClick={onRetry || defaultRetry}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            )}
            {showBack && (
              <Button variant="outline" size="sm" onClick={onBack || defaultBack}>
                <ArrowLeft className="mr-2 h-3 w-3" />
                Go Back
              </Button>
            )}
          </div>
        )}

        {children}
      </div>
    )
  }

  // Inline variant
  return (
    <div className={cn("flex items-center space-x-2 text-sm", className)}>
      <IconComponent className={cn("h-4 w-4", errorType.color)} />
      <span className="text-muted-foreground">{message || errorType.message}</span>
      {showRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry || defaultRetry}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Specific error components for common use cases
export function PageError({ 
  title, 
  message, 
  errorCode, 
  onRetry 
}: { 
  title?: string
  message?: string
  errorCode?: string
  onRetry?: () => void 
}) {
  return (
    <GlobalError 
      variant="page" 
      title={title}
      message={message}
      errorCode={errorCode}
      onRetry={onRetry}
    />
  )
}

export function CardError({ 
  title, 
  message, 
  onRetry,
  className 
}: { 
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <GlobalError 
      variant="card" 
      title={title}
      message={message}
      onRetry={onRetry}
      className={className}
    />
  )
}

export function InlineError({ 
  message, 
  onRetry,
  className 
}: { 
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <GlobalError 
      variant="inline" 
      message={message}
      onRetry={onRetry}
      showRetry={!!onRetry}
      className={className}
    />
  )
}

export function OverlayError({ 
  title, 
  message, 
  errorCode,
  onRetry 
}: { 
  title?: string
  message?: string
  errorCode?: string
  onRetry?: () => void 
}) {
  return (
    <GlobalError 
      variant="overlay" 
      title={title}
      message={message}
      errorCode={errorCode}
      onRetry={onRetry}
    />
  )
}