import type { RedisOptions } from 'ioredis';

/**
 * Redis module configuration options
 */
export type RedisModuleOptions = {
  /**
   * Redis host address
   * @default 'localhost'
   */
  host?: string;

  /**
   * Redis port number
   * @default 6379
   */
  port?: number;

  /**
   * Redis password for authentication
   */
  password?: string;

  /**
   * Redis database number to use
   * @default 0
   */
  db?: number;

  /**
   * Prefix for all Redis keys
   * @default 'jiva-ai:'
   */
  keyPrefix?: string;

  /**
   * Maximum number of reconnection attempts
   * @default 10
   */
  maxRetriesPerRequest?: number;

  /**
   * Enable offline queue
   * @default true
   */
  enableOfflineQueue?: boolean;

  /**
   * Enable ready check
   * @default true
   */
  enableReadyCheck?: boolean;

  /**
   * Additional ioredis options
   */
  redisOptions?: RedisOptions;
};

/**
 * Async factory function for Redis module options
 */
export type RedisModuleAsyncOptions = {
  /**
   * Factory function to create Redis module options
   */
  useFactory: (
    ...args: unknown[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;

  /**
   * Dependencies to inject into the factory function
   */
  inject?: unknown[];
};
