import { cacheService } from './cache-service';

// Cache decorator options
interface CacheOptions {
  key?: string;
  ttl?: number;
  prefix?: string;
  invalidateOn?: string[];
  condition?: (args: any[], result: any) => boolean;
}

// Cache decorator factory
export function Cache(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Generate cache key
      const cacheKey = generateCacheKey(
        options.key || `${target.constructor.name}:${propertyName}`,
        args,
        options.prefix
      );
      
      try {
        // Try to get from cache first
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult !== null) {
          console.log(`Cache HIT for ${cacheKey}`);
          return cachedResult;
        }
        
        // If not in cache, execute the method
        const result = await method.apply(this, args);
        
        // Check if we should cache the result
        if (shouldCacheResult(result, options.condition, args)) {
          const ttl = options.ttl || 3600; // Default 1 hour
          await cacheService.set(cacheKey, result, ttl);
          console.log(`Cache SET for ${cacheKey} with TTL ${ttl}s`);
        }
        
        return result;
      } catch (error) {
        console.error(`Cache decorator error for ${cacheKey}:`, error);
        // Fallback to original method on cache error
        return await method.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

// Invalidate cache decorator
export function InvalidateCache(pattern: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        // Execute the method first
        const result = await method.apply(this, args);
        
        // Invalidate cache after successful execution
        await cacheService.deletePattern(pattern);
        console.log(`Cache invalidated for pattern: ${pattern}`);
        
        return result;
      } catch (error) {
        console.error(`Invalidate cache decorator error:`, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Cache with TTL decorator
export function CacheWithTTL(ttl: number, key?: string) {
  return Cache({ ttl, key });
}

// Cache with prefix decorator
export function CacheWithPrefix(prefix: string, ttl?: number) {
  return Cache({ prefix, ttl });
}

// Generate cache key from function arguments
function generateCacheKey(baseKey: string, args: any[], prefix?: string): string {
  const argsHash = args.length > 0 
    ? Buffer.from(JSON.stringify(args)).toString('base64').slice(0, 8)
    : 'noargs';
  
  const fullKey = prefix ? `${prefix}:${baseKey}` : baseKey;
  return `${fullKey}:${argsHash}`;
}

// Check if result should be cached
function shouldCacheResult(
  result: any, 
  condition?: (args: any[], result: any) => boolean,
  args?: any[]
): boolean {
  if (!result) return false;
  if (condition && args) {
    return condition(args, result);
  }
  return true;
}

// Cache service decorators
export class CacheableService {
  // Cache product data
  @Cache({ prefix: 'products', ttl: 1800 })
  async getProduct(productId: string) {
    // This will be cached automatically
    return { id: productId, name: 'Sample Product' };
  }

  // Cache user data
  @Cache({ prefix: 'users', ttl: 7200 })
  async getUser(userId: string) {
    // This will be cached automatically
    return { id: userId, name: 'Sample User' };
  }

  // Invalidate cache when updating
  @InvalidateCache('products:*')
  async updateProduct(productId: string, data: any) {
    // Cache will be invalidated after this method
    return { id: productId, ...data };
  }

  // Cache with custom condition
  @Cache({ 
    prefix: 'orders', 
    ttl: 900,
    condition: (args, result) => result && result.status !== 'failed'
  })
  async getOrder(orderId: string) {
    // Only successful orders will be cached
    return { id: orderId, status: 'success' };
  }
}

// Cache middleware for API routes
export function withCache(options: CacheOptions = {}) {
  return function (handler: Function) {
    return async function (request: Request, ...args: any[]) {
      const cacheKey = options.key || `api:${request.url}`;
      
      try {
        // Try to get from cache
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult) {
          return new Response(JSON.stringify(cachedResult), {
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
          });
        }
        
        // Execute handler
        const result = await handler(request, ...args);
        
        // Cache the result
        if (result && result.status === 200) {
          const ttl = options.ttl || 3600;
          await cacheService.set(cacheKey, result, ttl);
        }
        
        return result;
      } catch (error) {
        console.error('Cache middleware error:', error);
        return await handler(request, ...args);
      }
    };
  };
}

// Cache invalidation helper
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    await cacheService.deletePattern(pattern);
    console.log(`Cache invalidated for pattern: ${pattern}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Bulk cache operations
export async function bulkCacheOperations(operations: Array<{
  action: 'set' | 'get' | 'delete';
  key: string;
  value?: any;
  ttl?: number;
}>): Promise<any[]> {
  const results = [];
  
  for (const operation of operations) {
    try {
      switch (operation.action) {
        case 'set':
          if (operation.value !== undefined) {
            await cacheService.set(operation.key, operation.value, operation.ttl);
            results.push({ key: operation.key, action: 'set', success: true });
          }
          break;
          
        case 'get':
          const value = await cacheService.get(operation.key);
          results.push({ key: operation.key, action: 'get', success: true, value });
          break;
          
        case 'delete':
          await cacheService.delete(operation.key);
          results.push({ key: operation.key, action: 'delete', success: true });
          break;
      }
    } catch (error) {
      results.push({ 
        key: operation.key, 
        action: operation.action, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
} 