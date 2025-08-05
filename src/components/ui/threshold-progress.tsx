import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface ThresholdProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max: number
  status?: "collecting" | "threshold-met" | "completed" | "cancelled"
  showLabel?: boolean
  label?: string
}

const ThresholdProgress = React.forwardRef<HTMLDivElement, ThresholdProgressProps>(
  ({ className, value, max, status = "collecting", showLabel = true, label, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)
    
    const getStatusColor = () => {
      switch (status) {
        case "collecting":
          return "from-accent to-accent/80"
        case "threshold-met":
          return "from-primary to-primary/80"
        case "completed":
          return "from-green-500 to-green-400"
        case "cancelled":
          return "from-destructive to-destructive/80"
        default:
          return "from-primary to-primary/80"
      }
    }

    const getStatusText = () => {
      switch (status) {
        case "collecting":
          return "Collecting Orders"
        case "threshold-met":
          return "Threshold Met!"
        case "completed":
          return "Completed"
        case "cancelled":
          return "Cancelled"
        default:
          return "In Progress"
      }
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {label || getStatusText()}
            </span>
            <span className="font-medium">
              {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          </div>
        )}
        <div className="threshold-progress">
          <div 
            className={cn(
              "threshold-progress-bar bg-gradient-to-r",
              getStatusColor()
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{percentage.toFixed(1)}% complete</span>
          {status === "threshold-met" && (
            <span className="text-primary font-medium">✓ Ready to order!</span>
          )}
        </div>
      </div>
    )
  }
)
ThresholdProgress.displayName = "ThresholdProgress"

export { ThresholdProgress }