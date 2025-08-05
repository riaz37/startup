import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SohozdaamCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "group-order" | "product" | "collecting" | "threshold-met" | "completed" | "cancelled"
  hover?: boolean
}

const SohozdaamCard = React.forwardRef<HTMLDivElement, SohozdaamCardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "default":
          return hover ? "card-hover" : "card-sohozdaam"
        case "group-order":
          return "group-order-card"
        case "collecting":
          return "group-order-card collecting"
        case "threshold-met":
          return "group-order-card threshold-met"
        case "completed":
          return "group-order-card completed"
        case "cancelled":
          return "group-order-card cancelled"
        case "product":
          return hover ? "card-hover relative overflow-hidden" : "card-sohozdaam relative overflow-hidden"
        default:
          return hover ? "card-hover" : "card-sohozdaam"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          getVariantClasses(),
          className
        )}
        {...props}
      />
    )
  }
)
SohozdaamCard.displayName = "SohozdaamCard"

const SohozdaamCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-6", className)} {...props} />
))
SohozdaamCardHeader.displayName = "SohozdaamCardHeader"

const SohozdaamCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
SohozdaamCardTitle.displayName = "SohozdaamCardTitle"

const SohozdaamCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SohozdaamCardDescription.displayName = "SohozdaamCardDescription"

const SohozdaamCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pb-6", className)} {...props} />
))
SohozdaamCardContent.displayName = "SohozdaamCardContent"

const SohozdaamCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
SohozdaamCardFooter.displayName = "SohozdaamCardFooter"

export {
  SohozdaamCard,
  SohozdaamCardHeader,
  SohozdaamCardTitle,
  SohozdaamCardDescription,
  SohozdaamCardContent,
  SohozdaamCardFooter,
}