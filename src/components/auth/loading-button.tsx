import { Button } from "@/components/ui/button"
import { ButtonLoading } from "@/components/ui/global-loading"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function LoadingButton({
  loading = false,
  children,
  className,
  disabled,
  variant = "default",
  size = "default",
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn(
        variant === "default" && "btn-primary",
        className
      )}
      disabled={loading || disabled}
      variant={variant}
      size={size}
      {...props}
    >
      {loading && <ButtonLoading className="mr-2" />}
      {children}
    </Button>
  )
}