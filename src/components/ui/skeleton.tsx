import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="border-2 border-transparent rounded-lg overflow-hidden bg-card">
      <div className="relative">
        <Skeleton className="w-full h-48" />
        <Skeleton className="absolute top-2 right-2 h-6 w-16" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="border-t pt-3">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}

// Group Order Card Skeleton
export function GroupOrderCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-card h-full flex flex-col">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
            <Skeleton className="h-5 w-16 sm:w-20" />
            <Skeleton className="h-5 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-3 w-12 sm:w-16" />
        </div>
        
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-20 sm:h-8 sm:w-24" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between text-xs">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
              <Skeleton className="h-4 w-6 sm:h-6 sm:w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 sm:w-16 mx-auto" />
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2 sm:space-x-3 mt-auto">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton({ 
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" 
}: { 
  className?: string;
}) {
  return (
    <div className={className}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-center mt-2">
            <Skeleton className="h-4 w-4 rounded-full mr-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-2">
          <Skeleton className="h-4 w-20" />
        </td>
      ))}
    </tr>
  )
}

// Analytics Chart Skeleton
export function AnalyticsChartSkeleton() {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-center space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Order History Skeleton
export function OrderHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Image Skeleton with shimmer effect
export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}

// Search Results Skeleton
export function SearchResultsSkeleton({ 
  count = 6, 
  className = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Navigation Skeleton
export function NavigationSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-8 w-32" />
      <div className="hidden md:flex space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-16" />
        ))}
      </div>
      <div className="ml-auto flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export { Skeleton } 