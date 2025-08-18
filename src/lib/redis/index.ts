import { createClient, RedisClientType } from 'redis';

// Redis client configuration
const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000,
    lazyConnect: true,
  },
});

// Error handling
redisClient.on('error', (err: Error) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

redisClient.on('end', () => {
  console.log('Redis Client Disconnected');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connection established successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Fallback to in-memory storage if Redis is not available
    console.warn('Falling back to in-memory storage');
  }
};

// Export the Redis client
export const redis = redisClient;

// Graceful shutdown
export const disconnectRedis = async () => {
  try {
    if (redisClient.isReady) {
      await redisClient.quit();
      console.log('Redis disconnected gracefully');
    }
  } catch (error) {
    console.error('Error disconnecting from Redis:', error);
  }
};

// Initialize Redis connection
if (process.env.NODE_ENV !== 'test') {
  connectRedis();
}

// Export a helper function to check if Redis is connected
export const isRedisConnected = () => redisClient.isReady;

// Export a helper function to safely execute Redis operations
export const safeRedisOperation = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> => {
  try {
    if (!redisClient.isReady) {
      console.warn('Redis not ready, skipping operation');
      return fallback || null;
    }
    return await operation();
  } catch (error) {
    console.error('Redis operation failed:', error);
    return fallback || null;
  }
}; 