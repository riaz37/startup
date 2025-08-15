import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '@/lib/cache-service';

// Cache hook options
interface UseCacheOptions<T> {
  key: string;
  ttl?: number;
  prefix?: string;
  fallback?: T;
  onError?: (error: Error) => void;
  onCacheHit?: (data: T) => void;
  onCacheMiss?: () => void;
}

// Cache hook return type
interface UseCacheReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
  setData: (data: T) => Promise<void>;
  isStale: boolean;
  lastUpdated: number | null;
}

// Cache entry with metadata
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Custom hook for Redis caching
export function useRedisCache<T>(
  options: UseCacheOptions<T>
): UseCacheReturn<T> {
  const {
    key,
    ttl = 3600,
    prefix = 'react',
    fallback = null,
    onError,
    onCacheHit,
    onCacheMiss,
  } = options;

  const [data, setDataState] = useState<T | null>(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const cacheKey = `${prefix}:${key}`;
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if data is stale
  const isStale = useCallback(() => {
    if (!lastUpdated) return true;
    const now = Date.now();
    const age = now - lastUpdated;
    return age > ttl * 1000;
  }, [lastUpdated, ttl]);

  // Fetch data from cache or source
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first
      const cachedEntry = await cacheService.get<CacheEntry<T>>(cacheKey);
      
      if (cachedEntry && !isStale()) {
        // Cache hit - use cached data
        setDataState(cachedEntry.data);
        setLastUpdated(cachedEntry.timestamp);
        onCacheHit?.(cachedEntry.data);
        return;
      }

      // Cache miss or stale data
      onCacheMiss?.();
      
      // If we have stale data, return it while fetching fresh data
      if (cachedEntry?.data) {
        setDataState(cachedEntry.data);
        setLastUpdated(cachedEntry.timestamp);
      }

      // Fetch fresh data (this should be implemented by the consumer)
      // For now, we'll just return the cached data if available
      if (cachedEntry?.data) {
        return;
      }

      // No cached data available
      setDataState(fallback);
      
    } catch (err) {
      if (signal?.aborted) return;
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      setDataState(fallback);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [cacheKey, ttl, isStale, onCacheHit, onCacheMiss, onError, fallback]);

  // Set data and cache it
  const setData = useCallback(async (newData: T) => {
    try {
      const cacheEntry: CacheEntry<T> = {
        data: newData,
        timestamp: Date.now(),
        ttl,
      };

      await cacheService.set(cacheKey, cacheEntry, ttl);
      setDataState(newData);
      setLastUpdated(cacheEntry.timestamp);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cache data');
      setError(error);
      onError?.(error);
    }
  }, [cacheKey, ttl, onError]);

  // Invalidate cache
  const invalidate = useCallback(async () => {
    try {
      await cacheService.delete(cacheKey);
      setDataState(fallback);
      setLastUpdated(null);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to invalidate cache');
      setError(error);
      onError?.(error);
    }
  }, [cacheKey, fallback, onError]);

  // Refetch data
  const refetch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    await fetchData(abortControllerRef.current.signal);
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Auto-refresh when data becomes stale
  useEffect(() => {
    if (!lastUpdated || !isStale()) return;

    const interval = setInterval(() => {
      if (isStale()) {
        refetch();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [lastUpdated, isStale, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    setData,
    isStale: isStale(),
    lastUpdated,
  };
}

// Hook for managing multiple cache entries
export function useMultiCache<T>(
  keys: string[],
  options: Omit<UseCacheOptions<T>, 'key'> = {}
): {
  data: Record<string, T | null>;
  loading: Record<string, boolean>;
  errors: Record<string, Error | null>;
  refetchAll: () => Promise<void>;
  invalidateAll: () => Promise<void>;
  setDataForKey: (key: string, data: T) => Promise<void>;
} {
  const [data, setData] = useState<Record<string, T | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});

  // Initialize state for all keys
  useEffect(() => {
    const initialData: Record<string, T | null> = {};
    const initialLoading: Record<string, boolean> = {};
    const initialErrors: Record<string, Error | null> = {};

    keys.forEach(key => {
      initialData[key] = options.fallback || null;
      initialLoading[key] = false;
      initialErrors[key] = null;
    });

    setData(initialData);
    setLoading(initialLoading);
    setErrors(initialErrors);
  }, [keys, options.fallback]);

  // Refetch all data
  const refetchAll = useCallback(async () => {
    const promises = keys.map(async (key) => {
      try {
        setLoading(prev => ({ ...prev, [key]: true }));
        setErrors(prev => ({ ...prev, [key]: null }));

        const cacheKey = `${options.prefix || 'react'}:${key}`;
        const cachedData = await cacheService.get<T>(cacheKey);
        
        if (cachedData) {
          setData(prev => ({ ...prev, [key]: cachedData }));
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setErrors(prev => ({ ...prev, [key]: err }));
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    });

    await Promise.allSettled(promises);
  }, [keys, options.prefix]);

  // Invalidate all cache entries
  const invalidateAll = useCallback(async () => {
    const promises = keys.map(async (key) => {
      try {
        const cacheKey = `${options.prefix || 'react'}:${key}`;
        await cacheService.delete(cacheKey);
        setData(prev => ({ ...prev, [key]: options.fallback || null }));
        setErrors(prev => ({ ...prev, [key]: null }));
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to invalidate cache');
        setErrors(prev => ({ ...prev, [key]: err }));
      }
    });

    await Promise.allSettled(promises);
  }, [keys, options.prefix, options.fallback]);

  // Set data for a specific key
  const setDataForKey = useCallback(async (key: string, newData: T) => {
    try {
      const cacheKey = `${options.prefix || 'react'}:${key}`;
      const ttl = options.ttl || 3600;
      
      await cacheService.set(cacheKey, newData, ttl);
      setData(prev => ({ ...prev, [key]: newData }));
      setErrors(prev => ({ ...prev, [key]: null }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to cache data');
      setErrors(prev => ({ ...prev, [key]: err }));
    }
  }, [options.prefix, options.ttl]);

  return {
    data,
    loading,
    errors,
    refetchAll,
    invalidateAll,
    setDataForKey,
  };
}

// Hook for cache statistics
export function useCacheStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cacheStats = await cacheService.getCacheStats();
      setStats(cacheStats);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch cache stats');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
} 