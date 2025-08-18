"use client";

import { useState, useEffect } from "react";
import { ClientPageLayout } from "@/components/layout/client-page-layout";
import { PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { GroupOrderCard } from "@/components/group-orders/group-order-card";
import { Users, Clock, TrendingUp, Filter } from "lucide-react";
import { GroupOrder } from "@/types";
import { LazyList, useProgressiveLoading } from "@/components/ui/lazy-load";
import { GroupOrderCardSkeleton, SearchResultsSkeleton } from "@/components/ui/skeleton";
import { EnhancedGroupOrdersLoading } from "@/components/ui/enhanced-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GroupOrdersPage() {
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("expires-soon");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Progressive loading hook
  const { visibleItems, isLoading, hasMore, loadMore } = useProgressiveLoading(
    filteredOrders,
    8,
    300
  );

  useEffect(() => {
    fetchGroupOrders();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [groupOrders, searchTerm, statusFilter, sortBy]);

  const fetchGroupOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/group-orders');
      if (!response.ok) {
        throw new Error('Failed to fetch group orders');
      }
      const data = await response.json();
      setGroupOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch group orders'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        // The API returns { success: true, categories: [...] }
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error('Categories API returned unexpected data structure:', data);
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = groupOrders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "expires-soon":
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case "expires-late":
          return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
        case "progress-high":
          return b.progressPercentage - a.progressPercentage;
        case "progress-low":
          return a.progressPercentage - b.progressPercentage;
        case "price-low":
          return a.pricePerUnit - b.pricePerUnit;
        case "price-high":
          return b.pricePerUnit - a.pricePerUnit;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderGroupOrderCard = (order: GroupOrder, index: number) => (
    <GroupOrderCard
      key={order.id}
      groupOrder={order}
      formatPrice={formatPrice}
    />
  );

  const getStatusCount = (status: string) => {
    return groupOrders.filter(order => order.status === status).length;
  };

  if (error) {
    return (
      <ClientPageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading group orders: {error.message}</p>
              <Button onClick={fetchGroupOrders} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  return (
    <ClientPageLayout>
      <MainContainer>
        <PageHeader
          badge="🛒 Active Group Orders"
          title="Join Group Orders & Save Big"
          highlightedWord="Save Big"
          description="Discover active group orders and join others to unlock bulk pricing on quality products. The more people join, the bigger the savings!"
        />

        {/* Status Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{getStatusCount('COLLECTING')}</div>
              <div className="text-sm text-muted-foreground">Collecting</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{getStatusCount('THRESHOLD_MET')}</div>
              <div className="text-sm text-muted-foreground">Threshold Met</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent">{getStatusCount('ORDERED')}</div>
              <div className="text-sm text-muted-foreground">Ordered</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success">{getStatusCount('DELIVERED')}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search group orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COLLECTING">Collecting Orders</SelectItem>
                <SelectItem value="THRESHOLD_MET">Threshold Met</SelectItem>
                <SelectItem value="ORDERED">Ordered</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expires-soon">Expires Soon</SelectItem>
                <SelectItem value="expires-late">Expires Later</SelectItem>
                <SelectItem value="progress-high">High Progress</SelectItem>
                <SelectItem value="progress-low">Low Progress</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredOrders.length} group order{filteredOrders.length !== 1 ? 's' : ''} found
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSortBy("expires-soon");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Group Orders Grid with Lazy Loading */}
        {loading ? (
          <EnhancedGroupOrdersLoading count={8} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Group Orders Found"
            description={
              searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Check back later for new group ordering opportunities, or create your own!"
            }
            actionLabel={searchTerm || statusFilter !== "all" ? "Clear Filters" : "Create Group Order"}
            actionHref={searchTerm || statusFilter !== "all" ? "#" : "/admin/group-orders/create"}
            onAction={searchTerm || statusFilter !== "all" ? () => {
              setSearchTerm("");
              setStatusFilter("all");
            } : undefined}
          />
        ) : (
          <LazyList
            items={filteredOrders}
            renderItem={renderGroupOrderCard}
            skeletonComponent={GroupOrderCardSkeleton}
            pageSize={8}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          />
        )}

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="mt-8 text-center">
            <Button onClick={loadMore} variant="outline" size="lg">
              Load More Orders
            </Button>
          </div>
        )}
      </MainContainer>
    </ClientPageLayout>
  );
}