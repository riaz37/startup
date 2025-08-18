"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Skeleton, ImageSkeleton } from "./skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ 
  src, 
  alt, 
  className, 
  placeholder = <ImageSkeleton className={className} />,
  onLoad,
  onError 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // If there's an error, show error state
  if (hasError) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <>
      {!isLoaded && placeholder}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        crossOrigin="anonymous"
      />
    </>
  );
}

interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  skeletonComponent: React.ComponentType<{ count?: number }>;
  pageSize?: number;
  threshold?: number;
  className?: string;
}

export function LazyList<T>({
  items,
  renderItem,
  skeletonComponent: SkeletonComponent,
  pageSize = 12,
  threshold = 0.8,
  className
}: LazyListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= items.length) return;
    
    setIsLoading(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + pageSize, items.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, visibleCount, items.length, pageSize]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < items.length) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin: "100px"
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, visibleCount, items.length, threshold]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((item, index) => renderItem(item, index))}
      </div>
      
      {hasMore && (
        <div ref={sentinelRef} className="mt-8">
          {isLoading ? (
            <div className="flex justify-center">
              <SkeletonComponent count={4} />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse text-muted-foreground">
                Scroll to load more...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil(scrollTop / itemHeight) + visibleCount + overscan);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Progressive loading hook
export function useProgressiveLoading<T>(
  items: T[],
  pageSize: number = 12,
  delay: number = 300
) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPage = () => {
      setIsLoading(true);
      setTimeout(() => {
        const newItems = items.slice(0, currentPage * pageSize);
        setVisibleItems(newItems);
        setIsLoading(false);
      }, delay);
    };

    loadPage();
  }, [items, currentPage, pageSize, delay]);

  const loadMore = useCallback(() => {
    if (isLoading || visibleItems.length >= items.length) return;
    setCurrentPage(prev => prev + 1);
  }, [isLoading, visibleItems.length, items.length]);

  const hasMore = visibleItems.length < items.length;

  return {
    visibleItems,
    isLoading,
    hasMore,
    loadMore
  };
} 