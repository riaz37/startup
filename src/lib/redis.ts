import { createClient, RedisClientType } from 'redis';
import { Redis } from 'ioredis';

// Redis Client Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client instances
let redisClient: RedisClientType | null = null;
let ioredisClient: Redis | null = null;

// Initialize Redis client
export async function initializeRedis() {
  try {
    // Create Redis client using redis package
    redisClient = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        connectTimeout: redisConfig.connectTimeout,
        commandTimeout: redisConfig.commandTimeout,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    });

    // Create ioredis client for advanced features
    ioredisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      retryDelayOnFailover: redisConfig.retryDelayOnFailover,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      lazyConnect: redisConfig.lazyConnect,
      keepAlive: redisConfig.keepAlive,
    });

    // Set up event handlers for redis client
    redisClient.on('error', (err) => {
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

    // Set up event handlers for ioredis client
    ioredisClient.on('error', (err) => {
      console.error('ioredis Client Error:', err);
    });

    ioredisClient.on('connect', () => {
      console.log('ioredis Client Connected');
    });

    ioredisClient.on('ready', () => {
      console.log('ioredis Client Ready');
    });

    ioredisClient.on('end', () => {
      console.log('ioredis Client Disconnected');
    });

    // Connect to Redis
    await redisClient.connect();
    await ioredisClient.connect();

    console.log('Redis clients initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return false;
  }
}

// Get Redis client
export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

// Get ioredis client
export function getIoRedisClient(): Redis {
  if (!ioredisClient) {
    throw new Error('ioredis client not initialized. Call initializeRedis() first.');
  }
  return ioredisClient;
}

// Check if Redis is connected
export function isRedisConnected(): boolean {
  return redisClient?.isReady || false;
}

// Graceful shutdown
export async function closeRedis() {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
    if (ioredisClient) {
      await ioredisClient.quit();
      ioredisClient = null;
    }
    console.log('Redis connections closed');
  } catch (error) {
    console.error('Error closing Redis connections:', error);
  }
}

// Health check
export async function redisHealthCheck(): Promise<boolean> {
  try {
    if (!redisClient || !ioredisClient) {
      return false;
    }
    
    await redisClient.ping();
    await ioredisClient.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Export default client for backward compatibility
export default redisClient; 