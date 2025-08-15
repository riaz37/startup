import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache-service';

// Cache configuration for different routes
const CACHE_ROUTES = {
  // Product routes
  '/api/products': {
    ttl: 1800, // 30 minutes
    key: 'products:list',
    invalidateOn: ['POST', 'PUT', 'DELETE'],
  },
  '/api/products/': {
    ttl: 3600, // 1 hour
    key: 'products:detail',
    invalidateOn: ['PUT', 'DELETE'],
  },
  
  // Group order routes
  '/api/group-orders': {
    ttl: 300, // 5 minutes
    key: 'group_orders:list',
    invalidateOn: ['POST', 'PUT', 'DELETE'],
  },
  '/api/group-orders/': {
    ttl: 300, // 5 minutes
    key: 'group_orders:detail',
    invalidateOn: ['PUT', 'DELETE'],
  },
  
  // Order routes
  '/api/orders': {
    ttl: 900, // 15 minutes
    key: 'orders:list',
    invalidateOn: ['POST', 'PUT', 'DELETE'],
  },
  '/api/orders/': {
    ttl: 900, // 15 minutes
    key: 'orders:detail',
    invalidateOn: ['PUT', 'DELETE'],
  },
  
  // User routes
  '/api/users': {
    ttl: 7200, // 2 hours
    key: 'users:list',
    invalidateOn: ['POST', 'PUT', 'DELETE'],
  },
  '/api/users/': {
    ttl: 7200, // 2 hours
    key: 'users:detail',
    invalidateOn: ['PUT', 'DELETE'],
  },
  
  // Analytics routes
  '/api/analytics': {
    ttl: 1800, // 30 minutes
    key: 'analytics:data',
    invalidateOn: ['POST'],
  },
};

// Generate cache key based on route and query parameters
function generateCacheKey(route: string, method: string, queryParams?: URLSearchParams): string {
  const baseKey = CACHE_ROUTES[route as keyof typeof CACHE_ROUTES]?.key || 'api:response';
  const methodKey = method.toLowerCase();
  
  if (queryParams && queryParams.toString()) {
    return `${baseKey}:${methodKey}:${Buffer.from(queryParams.toString()).toString('base64')}`;
  }
  
  return `${baseKey}:${methodKey}`;
}

// Check if route should be cached
function shouldCache(route: string, method: string): boolean {
  const routeConfig = CACHE_ROUTES[route as keyof typeof CACHE_ROUTES];
  return routeConfig && method === 'GET';
}

// Check if route should invalidate cache
function shouldInvalidateCache(route: string, method: string): boolean {
  const routeConfig = CACHE_ROUTES[route as keyof typeof CACHE_ROUTES];
  return routeConfig && routeConfig.invalidateOn.includes(method as any);
}

// Get route pattern from URL
function getRoutePattern(url: string): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  // Find matching route pattern
  for (const route of Object.keys(CACHE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return route;
    }
  }
  
  return pathname;
}

// Redis cache middleware
export async function redisCacheMiddleware(
  request: NextRequest,
  response: NextResponse,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  const url = request.url;
  const method = request.method;
  const routePattern = getRoutePattern(url);
  
  try {
    // Handle cache invalidation for write operations
    if (shouldInvalidateCache(routePattern, method)) {
      await invalidateRelatedCache(routePattern, method, url);
    }
    
    // Handle caching for read operations
    if (shouldCache(routePattern, method)) {
      const cacheKey = generateCacheKey(routePattern, method, new URL(url).searchParams);
      const cachedResponse = await cacheService.get(cachedResponse);
      
      if (cachedResponse) {
        // Return cached response
        return new NextResponse(JSON.stringify(cachedResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
          },
        });
      }
    }
    
    // Continue to next middleware/handler
    const result = await next();
    
    // Cache successful GET responses
    if (shouldCache(routePattern, method) && result.status === 200) {
      try {
        const responseData = await result.json();
        const cacheKey = generateCacheKey(routePattern, method, new URL(url).searchParams);
        const routeConfig = CACHE_ROUTES[routePattern as keyof typeof CACHE_ROUTES];
        
        if (routeConfig) {
          await cacheService.set(cacheKey, responseData, routeConfig.ttl);
          
          // Add cache headers to response
          result.headers.set('X-Cache', 'MISS');
          result.headers.set('X-Cache-Key', cacheKey);
          result.headers.set('X-Cache-TTL', routeConfig.ttl.toString());
        }
      } catch (error) {
        console.error('Error caching response:', error);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Redis cache middleware error:', error);
    // Continue without caching on error
    return await next();
  }
}

// Invalidate related cache entries
async function invalidateRelatedCache(routePattern: string, method: string, url: string): Promise<void> {
  try {
    const routeConfig = CACHE_ROUTES[routePattern as keyof typeof CACHE_ROUTES];
    if (!routeConfig) return;
    
    // Invalidate specific cache entries
    const patterns = [
      `${routeConfig.key}:*`,
      `${routeConfig.key.split(':')[0]}:*`, // Invalidate parent category
    ];
    
    for (const pattern of patterns) {
      await cacheService.deletePattern(pattern);
    }
    
    // Invalidate related analytics cache
    if (routePattern.includes('products') || routePattern.includes('orders')) {
      await cacheService.deletePattern('analytics:*');
    }
    
    console.log(`Cache invalidated for route: ${routePattern}, method: ${method}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Cache warming function
export async function warmCacheForRoute(route: string, data: any): Promise<void> {
  try {
    const routeConfig = CACHE_ROUTES[route as keyof typeof CACHE_ROUTES];
    if (routeConfig) {
      const cacheKey = `${routeConfig.key}:warmed`;
      await cacheService.set(cacheKey, data, routeConfig.ttl);
      console.log(`Cache warmed for route: ${route}`);
    }
  } catch (error) {
    console.error('Cache warming error:', error);
  }
}

// Bulk cache invalidation
export async function bulkInvalidateCache(patterns: string[]): Promise<void> {
  try {
    for (const pattern of patterns) {
      await cacheService.deletePattern(pattern);
    }
    console.log(`Bulk cache invalidation completed for ${patterns.length} patterns`);
  } catch (error) {
    console.error('Bulk cache invalidation error:', error);
  }
}

// Cache statistics for monitoring
export async function getCacheStats() {
  try {
    const stats = await cacheService.getCacheStats();
    const routeStats = {};
    
    // Get key counts for each route pattern
    for (const [route, config] of Object.entries(CACHE_ROUTES)) {
      const pattern = `${config.key}:*`;
      const keys = await cacheService.getKeys(pattern);
      routeStats[route] = {
        keyCount: keys.length,
        ttl: config.ttl,
        invalidateOn: config.invalidateOn,
      };
    }
    
    return {
      general: stats,
      routes: routeStats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
} 