import { DynamicModule, Global, Module, type Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_DEFAULTS } from './constants/redis.constants';
import type {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from './types/redis.types';
import { RedisService } from './redis.service';

/**
 * Redis Module
 * Provides Redis client and service for the application
 * Can be configured synchronously or asynchronously
 */
@Global()
@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions = {}): DynamicModule {
    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redisClient = new Redis({
          host: options.host ?? REDIS_DEFAULTS.HOST,
          port: options.port ?? REDIS_DEFAULTS.PORT,
          password: options.password,
          db: options.db ?? REDIS_DEFAULTS.DB,
          keyPrefix: options.keyPrefix ?? REDIS_DEFAULTS.KEY_PREFIX,
          maxRetriesPerRequest:
            options.maxRetriesPerRequest ?? REDIS_DEFAULTS.MAX_RETRIES,
          enableOfflineQueue: options.enableOfflineQueue ?? true,
          enableReadyCheck: options.enableReadyCheck ?? true,
          retryStrategy: (times: number) => {
            if (times > REDIS_DEFAULTS.MAX_RETRIES) {
              return null; // Stop retrying
            }
            return Math.min(times * REDIS_DEFAULTS.RETRY_DELAY, 10000);
          },
          ...options.redisOptions,
        });

        return redisClient;
      },
    };

    return {
      module: RedisModule,
      providers: [redisClientProvider, RedisService],
      exports: [RedisService, REDIS_CLIENT],
    };
  }

  /**
   * Register Redis module with asynchronous configuration
   * Useful when configuration depends on other services (e.g., ConfigService)
   * @param options - Async Redis module options
   */
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async (...args: unknown[]) => {
        const moduleOptions = await options.useFactory(...args);

        const redisClient = new Redis({
          host: moduleOptions.host ?? REDIS_DEFAULTS.HOST,
          port: moduleOptions.port ?? REDIS_DEFAULTS.PORT,
          password: moduleOptions.password,
          db: moduleOptions.db ?? REDIS_DEFAULTS.DB,
          keyPrefix: moduleOptions.keyPrefix ?? REDIS_DEFAULTS.KEY_PREFIX,
          maxRetriesPerRequest:
            moduleOptions.maxRetriesPerRequest ?? REDIS_DEFAULTS.MAX_RETRIES,
          enableOfflineQueue: moduleOptions.enableOfflineQueue ?? true,
          enableReadyCheck: moduleOptions.enableReadyCheck ?? true,
          retryStrategy: (times: number) => {
            if (times > REDIS_DEFAULTS.MAX_RETRIES) {
              return null; // Stop retrying
            }
            return Math.min(times * REDIS_DEFAULTS.RETRY_DELAY, 10000);
          },
          ...moduleOptions.redisOptions,
        });

        return redisClient;
      },
      inject: (options.inject ?? []) as any[],
    };

    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [redisClientProvider, RedisService],
      exports: [RedisService, REDIS_CLIENT],
    };
  }

  /**
   * Convenience method to register Redis module with ConfigService
   * Reads configuration from environment variables
   */
  static forRootWithConfig(): DynamicModule {
    return this.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST', REDIS_DEFAULTS.HOST),
        port: configService.get<number>('REDIS_PORT', REDIS_DEFAULTS.PORT),
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_DB', REDIS_DEFAULTS.DB),
        keyPrefix: configService.get<string>(
          'REDIS_KEY_PREFIX',
          REDIS_DEFAULTS.KEY_PREFIX,
        ),
      }),
      inject: [ConfigService] as any[],
    });
  }
}
