import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './constants/redis.constants';

/**
 * Redis Service
 * Provides a wrapper around ioredis client with common operations
 * and structured logging
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers for Redis client
   */
  private setupEventHandlers(): void {
    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.redisClient.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.redisClient.on('error', (error: Error) => {
      this.logger.error('Redis client error:', error.message);
    });

    this.redisClient.on('close', () => {
      this.logger.warn('Redis client connection closed');
    });

    this.redisClient.on('reconnecting', () => {
      this.logger.log('Redis client reconnecting...');
    });
  }

  /**
   * Get the underlying Redis client instance
   */
  getClient(): Redis {
    return this.redisClient;
  }

  /**
   * Get a value from Redis
   * @param key - The key to retrieve
   * @returns The value or null if not found
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from Redis and parse it as JSON
   * @param key - The key to retrieve
   * @returns The parsed value or null if not found
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error parsing JSON for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set a value in Redis
   * @param key - The key to set
   * @param value - The value to store
   * @param ttl - Time to live in seconds (optional)
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redisClient.setex(key, ttl, value);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set a value in Redis as JSON
   * @param key - The key to set
   * @param value - The value to store (will be JSON stringified)
   * @param ttl - Time to live in seconds (optional)
   */
  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.set(key, jsonValue, ttl);
    } catch (error) {
      this.logger.error(`Error setting JSON for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   * @param key - The key to delete
   * @returns Number of keys deleted
   */
  async del(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple keys from Redis
   * @param keys - The keys to delete
   * @returns Number of keys deleted
   */
  async delMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;

    try {
      return await this.redisClient.del(...keys);
    } catch (error) {
      this.logger.error(`Error deleting keys:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set expiration time for a key
   * @param key - The key to set expiration for
   * @param ttl - Time to live in seconds
   * @returns True if the timeout was set, false if key doesn't exist
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get the remaining time to live for a key
   * @param key - The key to check
   * @returns TTL in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment a numeric value in Redis
   * @param key - The key to increment
   * @param amount - Amount to increment by (default: 1)
   * @returns The new value after increment
   */
  async incr(key: string, amount = 1): Promise<number> {
    try {
      if (amount === 1) {
        return await this.redisClient.incr(key);
      }
      return await this.redisClient.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Decrement a numeric value in Redis
   * @param key - The key to decrement
   * @param amount - Amount to decrement by (default: 1)
   * @returns The new value after decrement
   */
  async decr(key: string, amount = 1): Promise<number> {
    try {
      if (amount === 1) {
        return await this.redisClient.decr(key);
      }
      return await this.redisClient.decrby(key, amount);
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get all keys matching a pattern
   * @param pattern - The pattern to match (e.g., 'user:*')
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      this.logger.error(`Error getting keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Flush all keys from the current database
   * WARNING: This will delete all data in the current database
   */
  async flushDb(): Promise<void> {
    try {
      await this.redisClient.flushdb();
      this.logger.warn('Redis database flushed');
    } catch (error) {
      this.logger.error('Error flushing database:', error);
      throw error;
    }
  }

  /**
   * Ping the Redis server
   * @returns 'PONG' if successful
   */
  async ping(): Promise<string> {
    try {
      return await this.redisClient.ping();
    } catch (error) {
      this.logger.error('Error pinging Redis:', error);
      throw error;
    }
  }

  /**
   * Gracefully disconnect from Redis
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting Redis client...');
    await this.redisClient.quit();
    this.logger.log('Redis client disconnected');
  }
}
