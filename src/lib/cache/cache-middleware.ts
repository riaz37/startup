import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from './cache-service';

// Cache middleware configuration
export interface CacheMiddlewareOptions {
  ttl?: number;
  key?: string;
  prefix?: string;
  condition?: (req: NextRequest, res: NextResponse) => boolean;
  varyBy?: string[]; // Headers to vary cache by
  tags?: string[]; // Cache tags for invalidation
}

// Generate cache key from request
function generateRequestCacheKey(
  req: NextRequest, 
  options: CacheMiddlewareOptions
): string {
  const url = req.url;
  const method = req.method;
  const baseKey = options.key || `${method}:${url}`;
  
  // Add query parameters to cache key
  const searchParams = req.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  // Add headers that should vary the cache
  let varyKey = '';
  if (options.varyBy) {
    const varyHeaders = options.varyBy
      .map(header => req.headers.get(header))
      .filter(Boolean)
      .join(':');
    if (varyHeaders) {
      varyKey = `:${varyHeaders}`;
    }
  }
  
  // Add user context if available
  const authHeader = req.headers.get('authorization');
  const userKey = authHeader ? `:${Buffer.from(authHeader).toString('base64').slice(0, 8)}` : '';
  
  return `${options.prefix || 'api'}:${baseKey}:${queryString}${varyKey}${userKey}`;
}

// Cache middleware for API routes
export function withCache(options: CacheMiddlewareOptions = {}) {
  return function (handler: Function) {
    return async function (req: NextRequest, ...args: any[]) {
      // Skip caching for non-GET requests by default
      if (req.method !== 'GET' && !options.key) {
        return await handler(req, ...args);
      }
      
      const cacheKey = generateRequestCacheKey(req, options);
      
      try {
        // Try to get from cache
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult) {
          // Return cached response with cache headers
          const response = NextResponse.json(cachedResult.data, cachedResult.status);
          response.headers.set('X-Cache', 'HIT');
          response.headers.set('X-Cache-Key', cacheKey);
          response.headers.set('Cache-Control', `public, max-age=${options.ttl || 3600}`);
          return response;
        }
        
        // Execute handler
        const result = await handler(req, ...args);
        
        // Check if we should cache the result
        if (shouldCacheResponse(result, options.condition, req)) {
          const ttl = options.ttl || 3600;
          const cacheData = {
            data: result.body || result,
            status: result.status || 200,
            headers: result.headers,
            timestamp: Date.now(),
          };
          
          await cacheService.set(cacheKey, cacheData, ttl);
          
          // Add cache tags if specified
          if (options.tags && options.tags.length > 0) {
            await cacheService.hSet(`cache:tags:${cacheKey}`, 'tags', options.tags);
          }
          
          // Add cache key to response headers
          if (result instanceof NextResponse) {
            result.headers.set('X-Cache', 'MISS');
            result.headers.set('X-Cache-Key', cacheKey);
            result.headers.set('Cache-Control', `public, max-age=${ttl}`);
          }
        }
        
        return result;
      } catch (error) {
        console.error('Cache middleware error:', error);
        // Fallback to handler on cache error
        return await handler(req, ...args);
      }
    };
  };
}

// Check if response should be cached
function shouldCacheResponse(
  response: any,
  condition?: (req: NextRequest, res: NextResponse) => boolean,
  req?: NextRequest
): boolean {
  if (!response) return false;
  
  // Don't cache error responses
  if (response.status && response.status >= 400) return false;
  
  // Check custom condition
  if (condition && req) {
    return condition(req, response);
  }
  
  return true;
}

// Cache invalidation by tags
export async function invalidateCacheByTags(tags: string[]): Promise<void> {
  try {
    // Get all cache keys with matching tags
    const pattern = 'cache:tags:*';
    const tagKeys = await cacheService.getKeys(pattern);
    
    for (const tagKey of tagKeys) {
      const cacheTags = await cacheService.hGet<string[]>(tagKey, 'tags');
      if (cacheTags && tags.some(tag => cacheTags.includes(tag))) {
        // Extract the actual cache key from tag key
        const actualCacheKey = tagKey.replace('cache:tags:', '');
        await cacheService.delete(actualCacheKey);
        await cacheService.delete(tagKey);
      }
    }
    
    console.log(`Cache invalidated for tags: ${tags.join(', ')}`);
  } catch (error) {
    console.error('Cache tag invalidation error:', error);
  }
}

// Cache warming for specific routes
export async function warmCacheForRoute(
  route: string,
  dataFetcher: () => Promise<any>,
  options: CacheMiddlewareOptions = {}
): Promise<void> {
  try {
    const cacheKey = `${options.prefix || 'api'}:GET:${route}`;
    const data = await dataFetcher();
    
    if (data) {
      const ttl = options.ttl || 3600;
      await cacheService.set(cacheKey, data, ttl);
      console.log(`Cache warmed for route: ${route}`);
    }
  } catch (error) {
    console.error(`Cache warming error for route ${route}:`, error);
  }
}

// Bulk cache warming
export async function bulkWarmCache(
  routes: Array<{
    route: string;
    dataFetcher: () => Promise<any>;
    options?: CacheMiddlewareOptions;
  }>
): Promise<void> {
  const promises = routes.map(({ route, dataFetcher, options }) =>
    warmCacheForRoute(route, dataFetcher, options)
  );
  
  await Promise.allSettled(promises);
}

// Cache statistics for monitoring
export async function getCacheStats() {
  try {
    const stats = await cacheService.getCacheStats();
    const tagStats = await getTagStatistics();
    
    return {
      ...stats,
      tagStats,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
}

// Get tag statistics
async function getTagStatistics() {
  try {
    const tagKeys = await cacheService.getKeys('cache:tags:*');
    const tagCounts: Record<string, number> = {};
    
    for (const tagKey of tagKeys) {
      const tags = await cacheService.hGet<string[]>(tagKey, 'tags');
      if (tags) {
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    }
    
    return tagCounts;
  } catch (error) {
    console.error('Tag statistics error:', error);
    return {};
  }
}

// Cache health check
export async function checkCacheHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: any;
}> {
  try {
    const startTime = Date.now();
    await cacheService.set('health:check', { timestamp: startTime }, 60);
    const result = await cacheService.get('health:check');
    const endTime = Date.now();
    
    const latency = endTime - startTime;
    const isHealthy = result && result.timestamp === startTime;
    
    if (isHealthy && latency < 100) {
      return {
        status: 'healthy',
        details: { latency, timestamp: startTime }
      };
    } else if (isHealthy && latency < 500) {
      return {
        status: 'degraded',
        details: { latency, timestamp: startTime }
      };
    } else {
      return {
        status: 'unhealthy',
        details: { latency, timestamp: startTime, error: 'Cache operation failed' }
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
} 