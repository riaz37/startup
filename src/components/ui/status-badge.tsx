import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "success" | "warning" | "error" | "primary" | "secondary" | 
          "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  children: React.ReactNode
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, children, ...props }, ref) => {
    const getStatusClasses = () => {
      switch (status) {
        case "success":
          return "badge-success"
        case "warning":
          return "badge-warning"
        case "error":
          return "badge-error"
        case "primary":
          return "badge-primary"
        case "secondary":
          return "badge-secondary"
        case "pending":
          return "status-pending px-3 py-1 rounded-full text-sm font-medium"
        case "confirmed":
          return "status-confirmed px-3 py-1 rounded-full text-sm font-medium"
        case "processing":
          return "status-processing px-3 py-1 rounded-full text-sm font-medium"
        case "shipped":
          return "status-shipped px-3 py-1 rounded-full text-sm font-medium"
        case "delivered":
          return "status-delivered px-3 py-1 rounded-full text-sm font-medium"
        case "cancelled":
          return "status-cancelled px-3 py-1 rounded-full text-sm font-medium"
        default:
          return "badge-primary"
      }
    }

    return (
      <Badge
        ref={ref}
        className={cn(getStatusClasses(), className)}
        {...props}
      >
        {children}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }