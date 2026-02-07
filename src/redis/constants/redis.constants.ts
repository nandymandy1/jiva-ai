/**
 * Redis Module Constants
 * Defines injection tokens and configuration constants for the Redis module
 */

/**
 * Injection token for the Redis client instance
 */
export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Injection token for Redis module options
 */
export const REDIS_MODULE_OPTIONS = 'REDIS_MODULE_OPTIONS';

/**
 * Default Redis configuration values
 */
export const REDIS_DEFAULTS = {
  /**
   * Default Redis host
   */
  HOST: 'localhost',

  /**
   * Default Redis port
   */
  PORT: 6379,

  /**
   * Default Redis database number
   */
  DB: 0,

  /**
   * Default key prefix for all Redis keys
   */
  KEY_PREFIX: 'jiva-ai:',

  /**
   * Default TTL for cached items (in seconds)
   * 1 hour = 3600 seconds
   */
  DEFAULT_TTL: 3600,

  /**
   * Maximum number of reconnection attempts
   */
  MAX_RETRIES: 10,

  /**
   * Delay between reconnection attempts (in milliseconds)
   */
  RETRY_DELAY: 3000,
} as const;
