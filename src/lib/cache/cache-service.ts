import { getRedisClient, getIoRedisClient } from './redis';

// Cache configuration
const CACHE_CONFIG = {
  // Default TTL (Time To Live) in seconds
  DEFAULT_TTL: 3600, // 1 hour
  
  // Cache prefixes for different data types
  PREFIXES: {
    PRODUCTS: 'products',
    ORDERS: 'orders',
    USERS: 'users',
    GROUP_ORDERS: 'group_orders',
    PAYMENTS: 'payments',
    DELIVERIES: 'deliveries',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics',
    SESSIONS: 'sessions',
  },
  
  // TTL for different data types (in seconds)
  TTL: {
    PRODUCTS: 1800,        // 30 minutes
    ORDERS: 900,           // 15 minutes
    USERS: 7200,           // 2 hours
    GROUP_ORDERS: 300,     // 5 minutes
    PAYMENTS: 1800,        // 30 minutes
    DELIVERIES: 600,       // 10 minutes
    NOTIFICATIONS: 3600,   // 1 hour
    ANALYTICS: 1800,       // 30 minutes
    SESSIONS: 86400,       // 24 hours
  },
};

// Cache key generator
function generateCacheKey(prefix: string, identifier: string, suffix?: string): string {
  return `${prefix}:${identifier}${suffix ? `:${suffix}` : ''}`;
}

// Cache service class
export class CacheService {
  private static instance: CacheService;
  private redisClient: ReturnType<typeof getRedisClient>;
  private ioredisClient: ReturnType<typeof getIoRedisClient>;

  private constructor() {
    this.redisClient = getRedisClient();
    this.ioredisClient = getIoRedisClient();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Basic cache operations
  async set(key: string, value: any, ttl: number = CACHE_CONFIG.DEFAULT_TTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.setEx(key, ttl, serializedValue);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redisClient.expire(key, ttl);
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
    }
  }

  // Pattern-based operations
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for pattern ${pattern}:`, error);
    }
  }

  async getKeys(pattern: string): Promise<string[]> {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      console.error(`Cache get keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  // Hash operations for complex objects
  async hSet(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.hSet(key, field, serializedValue);
    } catch (error) {
      console.error(`Cache hSet error for key ${key}, field ${field}:`, error);
    }
  }

  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redisClient.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache hGet error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hGetAll<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const hash = await this.redisClient.hGetAll(key);
      if (!hash || Object.keys(hash).length === 0) {
        return null;
      }

      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      console.error(`Cache hGetAll error for key ${key}:`, error);
      return null;
    }
  }

  async hDelete(key: string, field: string): Promise<void> {
    try {
      await this.redisClient.hDel(key, field);
    } catch (error) {
      console.error(`Cache hDelete error for key ${key}, field ${field}:`, error);
    }
  }

  // List operations
  async lPush(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.lPush(key, serializedValue);
    } catch (error) {
      console.error(`Cache lPush error for key ${key}:`, error);
    }
  }

  async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.redisClient.lRange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      console.error(`Cache lRange error for key ${key}:`, error);
      return [];
    }
  }

  async lTrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.redisClient.lTrim(key, start, stop);
    } catch (error) {
      console.error(`Cache lTrim error for key ${key}:`, error);
    }
  }

  // Set operations
  async sAdd(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.sAdd(key, serializedValue);
    } catch (error) {
      console.error(`Cache sAdd error for key ${key}:`, error);
    }
  }

  async sMembers<T>(key: string): Promise<T[]> {
    try {
      const values = await this.redisClient.sMembers(key);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      console.error(`Cache sMembers error for key ${key}:`, error);
      return [];
    }
  }

  async sRemove(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.sRem(key, serializedValue);
    } catch (error) {
      console.error(`Cache sRemove error for key ${key}:`, error);
    }
  }

  // Sorted set operations for rankings and time-based data
  async zAdd(key: string, score: number, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.ioredisClient.zadd(key, score, serializedValue);
    } catch (error) {
      console.error(`Cache zAdd error for key ${key}:`, error);
    }
  }

  async zRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.ioredisClient.zrange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      console.error(`Cache zRange error for key ${key}:`, error);
      return [];
    }
  }

  async zRevRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.ioredisClient.zrevrange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      console.error(`Cache zRevRange error for key ${key}:`, error);
      return [];
    }
  }

  // Cache with TTL helpers
  async setWithTTL(key: string, value: any, prefix: keyof typeof CACHE_CONFIG.PREFIXES): Promise<void> {
    const ttl = CACHE_CONFIG.TTL[prefix];
    await this.set(key, value, ttl);
  }

  // Product caching
  async cacheProduct(productId: string, productData: any): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.PRODUCTS, productId);
    await this.setWithTTL(key, productData, 'PRODUCTS');
  }

  async getCachedProduct<T>(productId: string): Promise<T | null> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.PRODUCTS, productId);
    return await this.get<T>(key);
  }

  async invalidateProductCache(productId: string): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.PRODUCTS, productId);
    await this.delete(key);
  }

  // Order caching
  async cacheOrder(orderId: string, orderData: any): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.ORDERS, orderId);
    await this.setWithTTL(key, orderData, 'ORDERS');
  }

  async getCachedOrder<T>(orderId: string): Promise<T | null> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.ORDERS, orderId);
    return await this.get<T>(key);
  }

  async invalidateOrderCache(orderId: string): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.ORDERS, orderId);
    await this.delete(key);
  }

  // User caching
  async cacheUser(userId: string, userData: any): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.USERS, userId);
    await this.setWithTTL(key, userData, 'USERS');
  }

  async getCachedUser<T>(userId: string): Promise<T | null> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.USERS, userId);
    return await this.get<T>(key);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.USERS, userId);
    await this.delete(key);
  }

  // Group order caching
  async cacheGroupOrder(groupOrderId: string, groupOrderData: any): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.GROUP_ORDERS, groupOrderId);
    await this.setWithTTL(key, groupOrderData, 'GROUP_ORDERS');
  }

  async getCachedGroupOrder<T>(groupOrderId: string): Promise<T | null> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.GROUP_ORDERS, groupOrderId);
    return await this.get<T>(key);
  }

  async invalidateGroupOrderCache(groupOrderId: string): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.GROUP_ORDERS, groupOrderId);
    await this.delete(key);
  }

  // Analytics caching
  async cacheAnalytics(key: string, data: any): Promise<void> {
    const cacheKey = generateCacheKey(CACHE_CONFIG.PREFIXES.ANALYTICS, key);
    await this.setWithTTL(cacheKey, data, 'ANALYTICS');
  }

  async getCachedAnalytics<T>(key: string): Promise<T | null> {
    const cacheKey = generateCacheKey(CACHE_CONFIG.PREFIXES.ANALYTICS, key);
    return await this.get<T>(cacheKey);
  }

  // Session caching
  async cacheSession(sessionId: string, sessionData: any): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.SESSIONS, sessionId);
    await this.setWithTTL(key, sessionData, 'SESSIONS');
  }

  async getCachedSession<T>(sessionId: string): Promise<T | null> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.SESSIONS, sessionId);
    return await this.get<T>(key);
  }

  async invalidateSessionCache(sessionId: string): Promise<void> {
    const key = generateCacheKey(CACHE_CONFIG.PREFIXES.SESSIONS, sessionId);
    await this.delete(key);
  }

  // Bulk operations
  async mGet<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redisClient.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mGet error:', error);
      return keys.map(() => null);
    }
  }

  async mSet(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      const pipeline = this.redisClient.multi();
      
      for (const { key, value, ttl } of keyValuePairs) {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          pipeline.setEx(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error('Cache mSet error:', error);
    }
  }

  // Cache statistics
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    connectedClients: number;
    hitRate: number;
  }> {
    try {
      const info = await this.ioredisClient.info();
      const stats: any = {};
      
      info.split('\r\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      });

      return {
        totalKeys: parseInt(stats.db0?.split(',')[0]?.split('=')[1] || '0'),
        memoryUsage: stats.used_memory_human || '0B',
        connectedClients: parseInt(stats.connected_clients || '0'),
        hitRate: parseFloat(stats.keyspace_hits || '0') / (parseFloat(stats.keyspace_misses || '0') + parseFloat(stats.keyspace_hits || '0')) * 100,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        connectedClients: 0,
        hitRate: 0,
      };
    }
  }

  // Cache warming
  async warmCache<T>(
    cacheKey: string,
    dataFetcher: () => Promise<T>,
    ttl: number = CACHE_CONFIG.DEFAULT_TTL
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedData = await this.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, fetch from source
      const freshData = await dataFetcher();
      
      // Cache the fresh data
      await this.set(cacheKey, freshData, ttl);
      
      return freshData;
    } catch (error) {
      console.error(`Cache warming error for key ${cacheKey}:`, error);
      // Fallback to data fetcher
      return await dataFetcher();
    }
  }

  // Cache invalidation patterns
  async invalidateUserRelatedCache(userId: string): Promise<void> {
    const patterns = [
      `${CACHE_CONFIG.PREFIXES.USERS}:${userId}`,
      `${CACHE_CONFIG.PREFIXES.ORDERS}:*`,
      `${CACHE_CONFIG.PREFIXES.PAYMENTS}:*`,
      `${CACHE_CONFIG.PREFIXES.DELIVERIES}:*`,
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  async invalidateProductRelatedCache(productId: string): Promise<void> {
    const patterns = [
      `${CACHE_CONFIG.PREFIXES.PRODUCTS}:${productId}`,
      `${CACHE_CONFIG.PREFIXES.GROUP_ORDERS}:*`,
      `${CACHE_CONFIG.PREFIXES.ANALYTICS}:*`,
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    try {
      await this.redisClient.flushDb();
      console.log('All cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Export helper functions
export {
  generateCacheKey,
  CACHE_CONFIG,
}; 