import { Button } from "@/components/ui/button";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UserPaginationProps {
  pagination: PaginationInfo;
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export function UserPagination({
  pagination,
  searchTerm,
  roleFilter,
  statusFilter,
  onPageChange,
  loading
}: UserPaginationProps) {
  if (pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} users
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1 || loading}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
            if (pageNum > pagination.pages) return null;
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 