import { NextRequest, NextResponse } from "next/server";
import { redisHealthCheck } from "@/lib/redis";
import { cacheService } from "@/lib/cache-service";

export async function GET(request: NextRequest) {
  try {
    // Basic Redis health check
    const isHealthy = await redisHealthCheck();
    
    if (!isHealthy) {
      return NextResponse.json(
        { 
          status: "unhealthy",
          redis: "disconnected",
          message: "Redis connection failed"
        },
        { status: 503 }
      );
    }

    // Get cache statistics
    const cacheStats = await cacheService.getCacheStats();
    
    // Get cache keys count for different prefixes
    const keyCounts = {
      products: await cacheService.getKeys('products:*').then(keys => keys.length),
      orders: await cacheService.getKeys('orders:*').then(keys => keys.length),
      users: await cacheService.getKeys('users:*').then(keys => keys.length),
      groupOrders: await cacheService.getKeys('group_orders:*').then(keys => keys.length),
      payments: await cacheService.getKeys('payments:*').then(keys => keys.length),
      deliveries: await cacheService.getKeys('deliveries:*').then(keys => keys.length),
      notifications: await cacheService.getKeys('notifications:*').then(keys => keys.length),
      analytics: await cacheService.getKeys('analytics:*').then(keys => keys.length),
      sessions: await cacheService.getKeys('sessions:*').then(keys => keys.length),
    };

    // Performance test
    const performanceTest = await runPerformanceTest();

    return NextResponse.json({
      status: "healthy",
      redis: "connected",
      timestamp: new Date().toISOString(),
      cache: {
        statistics: cacheStats,
        keyCounts,
        performance: performanceTest,
      },
      message: "Redis is operating normally"
    });
  } catch (error) {
    console.error("Redis health check error:", error);
    return NextResponse.json(
      { 
        status: "error",
        redis: "error",
        message: "Redis health check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function runPerformanceTest() {
  const testKey = 'health_check_test';
  const testData = { test: true, timestamp: Date.now() };
  
  try {
    // Test set operation
    const setStart = Date.now();
    await cacheService.set(testKey, testData, 60);
    const setTime = Date.now() - setStart;

    // Test get operation
    const getStart = Date.now();
    await cacheService.get(testKey);
    const getTime = Date.now() - getStart;

    // Test delete operation
    const deleteStart = Date.now();
    await cacheService.delete(testKey);
    const deleteTime = Date.now() - deleteStart;

    return {
      set: `${setTime}ms`,
      get: `${getTime}ms`,
      delete: `${deleteTime}ms`,
      average: `${Math.round((setTime + getTime + deleteTime) / 3)}ms`,
    };
  } catch (error) {
    console.error("Performance test error:", error);
    return {
      set: "failed",
      get: "failed",
      delete: "failed",
      average: "failed",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "clear_cache":
        await cacheService.clearAllCache();
        return NextResponse.json({
          message: "Cache cleared successfully",
          timestamp: new Date().toISOString(),
        });

      case "warm_cache":
        // Example cache warming
        await warmExampleCache();
        return NextResponse.json({
          message: "Cache warmed successfully",
          timestamp: new Date().toISOString(),
        });

      case "get_stats":
        const stats = await cacheService.getCacheStats();
        return NextResponse.json({
          stats,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Redis action error:", error);
    return NextResponse.json(
      { error: "Failed to perform Redis action" },
      { status: 500 }
    );
  }
}

async function warmExampleCache() {
  try {
    // Warm some common cache entries
    await cacheService.set('health_check:last_warm', {
      timestamp: Date.now(),
      status: 'warmed'
    }, 3600);

    // Add more cache warming logic here as needed
    console.log('Cache warming completed');
  } catch (error) {
    console.error('Cache warming error:', error);
    throw error;
  }
} 