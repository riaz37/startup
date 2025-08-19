import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading: boolean;
  totalUsers?: number;
  filteredCount?: number;
  lastRefresh?: Date | null;
}

export function UserFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onSearch,
  onClearFilters,
  onRefresh,
  loading,
  totalUsers,
  filteredCount,
  lastRefresh
}: UserFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Row */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch();
                  }
                }}
              />
            </div>
            <Button 
              onClick={onSearch}
              disabled={loading}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline"
              onClick={onClearFilters}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="BANNED">Banned</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Active Filters Display */}
            {(roleFilter !== "all" || statusFilter !== "all") && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Active:</span>
                {roleFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Role: {roleFilter}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {statusFilter}
                  </Badge>
                )}
              </div>
            )}

            <Badge variant="outline">
              {totalUsers ? `${totalUsers} total` : `${filteredCount || 0} users`}
            </Badge>
            
            {totalUsers && filteredCount && filteredCount !== totalUsers && (
              <Badge variant="secondary">
                {filteredCount} filtered
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {lastRefresh && (
              <div className="text-xs text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 