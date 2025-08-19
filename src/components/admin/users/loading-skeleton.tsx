import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          
          {/* Row skeletons */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-1/6 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-1/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-1/6 animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 