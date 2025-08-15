import { cacheService } from './cache-service';

// Redis Session Store for NextAuth
export class RedisSessionStore {
  private prefix = 'sessions';
  private ttl = 86400; // 24 hours

  // Store session data
  async set(sessionId: string, sessionData: any): Promise<void> {
    try {
      const key = `${this.prefix}:${sessionId}`;
      await cacheService.set(key, sessionData, this.ttl);
    } catch (error) {
      console.error('Redis session store set error:', error);
    }
  }

  // Get session data
  async get(sessionId: string): Promise<any | null> {
    try {
      const key = `${this.prefix}:${sessionId}`;
      return await cacheService.get(key);
    } catch (error) {
      console.error('Redis session store get error:', error);
      return null;
    }
  }

  // Delete session
  async delete(sessionId: string): Promise<void> {
    try {
      const key = `${this.prefix}:${sessionId}`;
      await cacheService.delete(key);
    } catch (error) {
      console.error('Redis session store delete error:', error);
    }
  }

  // Update session TTL
  async touch(sessionId: string): Promise<void> {
    try {
      const key = `${this.prefix}:${sessionId}`;
      const sessionData = await cacheService.get(key);
      if (sessionData) {
        await cacheService.set(key, sessionData, this.ttl);
      }
    } catch (error) {
      console.error('Redis session store touch error:', error);
    }
  }

  // Get all sessions for a user
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const pattern = `${this.prefix}:*`;
      const keys = await cacheService.getKeys(pattern);
      const sessions = [];
      
      for (const key of keys) {
        const sessionData = await cacheService.get(key);
        if (sessionData && sessionData.userId === userId) {
          sessions.push({
            sessionId: key.replace(`${this.prefix}:`, ''),
            ...sessionData,
          });
        }
      }
      
      return sessions;
    } catch (error) {
      console.error('Redis session store getUserSessions error:', error);
      return [];
    }
  }

  // Invalidate all sessions for a user
  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      for (const session of sessions) {
        await this.delete(session.sessionId);
      }
      console.log(`Invalidated ${sessions.length} sessions for user ${userId}`);
    } catch (error) {
      console.error('Redis session store invalidateUserSessions error:', error);
    }
  }

  // Get session statistics
  async getStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  }> {
    try {
      const pattern = `${this.prefix}:*`;
      const keys = await cacheService.getKeys(pattern);
      const totalSessions = keys.length;
      
      let activeSessions = 0;
      let expiredSessions = 0;
      
      for (const key of keys) {
        const sessionData = await cacheService.get(key);
        if (sessionData) {
          activeSessions++;
        } else {
          expiredSessions++;
        }
      }
      
      return {
        totalSessions,
        activeSessions,
        expiredSessions,
      };
    } catch (error) {
      console.error('Redis session store stats error:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
      };
    }
  }

  // Clean up expired sessions
  async cleanup(): Promise<void> {
    try {
      const pattern = `${this.prefix}:*`;
      const keys = await cacheService.getKeys(pattern);
      let cleanedCount = 0;
      
      for (const key of keys) {
        const sessionData = await cacheService.get(key);
        if (!sessionData) {
          await cacheService.delete(key);
          cleanedCount++;
        }
      }
      
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    } catch (error) {
      console.error('Redis session store cleanup error:', error);
    }
  }
}

// Export singleton instance
export const redisSessionStore = new RedisSessionStore(); 