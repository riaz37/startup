import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
  selectedSort?: string;
  onSortChange: (sort: string) => void;
  categories: { id: string; name: string }[];
  sortOptions: { value: string; label: string }[];
  onClearFilters: () => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  categories,
  sortOptions,
  onClearFilters
}: SearchFiltersProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const hasActiveFilters = searchQuery || selectedCategory || selectedSort;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="search-responsive">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 mobile-form-input"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-responsive">
        {/* Mobile Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="lg:hidden mobile-touch-target"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* Filter Controls */}
        <div className={`space-y-3 ${isFiltersExpanded ? 'block' : 'hidden lg:block'}`}>
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-responsive-sm font-medium text-foreground">
              Category
            </label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="mobile-form-input">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <label className="text-responsive-sm font-medium text-foreground">
              Sort By
            </label>
            <Select value={selectedSort} onValueChange={onSortChange}>
              <SelectTrigger className="mobile-form-input">
                <SelectValue placeholder="Default Sorting" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="w-full mobile-touch-target"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 