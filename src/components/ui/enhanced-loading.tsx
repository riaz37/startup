"use client";

import { cn } from "@/lib/utils";
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  Star,
  Zap,
  Heart
} from "lucide-react";

// Enhanced Product Grid Loading
export function EnhancedProductGridLoading({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Search and Filter Loading */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Products Grid Loading */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-card hover:shadow-lg transition-all duration-300">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="relative">
              {/* Image Loading */}
              <div className="relative w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute top-2 right-2">
                  <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="absolute bottom-2 left-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 animate-pulse" />
                </div>
              </div>

              {/* Content Loading */}
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  <div className="h-4 w-1/2 bg-muted/60 rounded animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-16 bg-muted/60 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted/60 rounded animate-pulse" />
                </div>
                
                <div className="border-t pt-3">
                  <div className="h-9 w-full bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Progress */}
      <div className="text-center py-8">
        <div className="inline-flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-medium text-muted-foreground animate-pulse">
              Loading amazing products...
            </div>
            <div className="text-sm text-muted-foreground/60">
              Discovering the best deals for you
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Group Orders Loading
export function EnhancedGroupOrdersLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Status Overview Loading */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border rounded-lg p-4 text-center relative overflow-hidden group">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative">
              <div className="h-8 w-16 bg-muted rounded animate-pulse mx-auto mb-2" style={{ animationDelay: `${i * 0.1}s` }} />
              <div className="h-4 w-20 bg-muted/60 rounded animate-pulse mx-auto" style={{ animationDelay: `${i * 0.15}s` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Loading */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-48 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Group Orders Grid Loading */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden bg-card relative group">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="relative p-6 space-y-4">
              {/* Header Loading */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-20 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  <div className="h-6 w-24 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                </div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
              
              {/* Product Info Loading */}
              <div className="flex items-start space-x-4">
                <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                    <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
                  <div className="h-8 w-28 bg-muted rounded animate-pulse" />
                </div>
              </div>
              
              {/* Progress Bar Loading */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" style={{ width: `${Math.random() * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <div className="h-3 w-20 bg-muted/60 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted/60 rounded animate-pulse" />
                </div>
              </div>
              
              {/* Stats Grid Loading */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-4 w-4 rounded-full bg-muted animate-pulse mr-1" />
                      <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-16 bg-muted/60 rounded animate-pulse mx-auto" />
                  </div>
                ))}
              </div>
              
              {/* Action Buttons Loading */}
              <div className="flex space-x-3">
                <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
                <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Progress */}
      <div className="text-center py-8">
        <div className="inline-flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-medium text-muted-foreground animate-pulse">
              Loading group orders...
            </div>
            <div className="text-sm text-muted-foreground/60">
              Finding the best bulk deals for you
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Analytics Loading
export function EnhancedAnalyticsLoading() {
  return (
    <div className="space-y-6 mb-8">
      {/* Header Loading */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Stats Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-6 bg-card relative overflow-hidden group">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              </div>
              <div className="flex items-center mt-2">
                <div className="h-4 w-4 rounded-full bg-muted animate-pulse mr-1" />
                <div className="h-4 w-16 bg-muted/60 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-lg p-6 bg-card">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              <div className="h-64 w-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
                  <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 w-16 bg-muted rounded animate-pulse" style={{ animationDelay: `${j * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Loading */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Empty State Loading
export function EnhancedEmptyStateLoading() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex flex-col items-center space-y-6">
        {/* Animated Icon */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
          </div>
          {/* Floating Elements */}
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent/20 animate-pulse" />
          <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-secondary/20 animate-pulse" />
        </div>
        
        {/* Text Loading */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-5 w-96 bg-muted/60 rounded animate-pulse mx-auto" />
        </div>
        
        {/* Action Button Loading */}
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
} 