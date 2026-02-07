import {
  DynamicModule,
  Module,
  type OnModuleDestroy,
  type Provider,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import type { ConnectionOptions } from 'bullmq';
import { QUEUE_DEFAULTS, QUEUE_NAMES } from './constants/queue.constants';
import type {
  QueueModuleAsyncOptions,
  QueueModuleOptions,
} from './types/queue.types';
import { QueueService } from './queue.service';

/**
 * Queue Module
 * Provides BullMQ queue and worker management for the application
 * Integrates with Redis for job queue functionality
 */
@Module({})
export class QueueModule implements OnModuleDestroy {
  private static workers: Worker[] = [];

  /**
   * Register Queue module with synchronous configuration
   * @param options - Queue module options
   */
  static forRoot(options: QueueModuleOptions): DynamicModule {
    const connection: ConnectionOptions = {
      host: options.connection.host ?? 'localhost',
      port: options.connection.port ?? 6379,
      password: options.connection.password,
      db: options.connection.db ?? 0,
    };

    const queueProviders: Provider[] = this.createQueueProviders(
      connection,
      options,
    );

    return {
      module: QueueModule,
      providers: [QueueService, ...queueProviders],
      exports: [QueueService],
    };
  }

  /**
   * Register Queue module with asynchronous configuration
   * @param options - Async Queue module options
   */
  static forRootAsync(options: QueueModuleAsyncOptions): DynamicModule {
    const queueProviders: Provider[] = [
      {
        provide: 'QUEUE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
      {
        provide: QueueService,
        useFactory: (moduleOptions: QueueModuleOptions) => {
          const connection: ConnectionOptions = {
            host: moduleOptions.connection.host ?? 'localhost',
            port: moduleOptions.connection.port ?? 6379,
            password: moduleOptions.connection.password,
            db: moduleOptions.connection.db ?? 0,
          };

          const queueService = new QueueService();

          // Create queues
          Object.values(QUEUE_NAMES).forEach((queueName) => {
            const queue = new Queue(queueName, {
              connection,
              ...moduleOptions.defaultQueueOptions,
              defaultJobOptions: {
                attempts: QUEUE_DEFAULTS.ATTEMPTS,
                backoff: {
                  type: QUEUE_DEFAULTS.BACKOFF_TYPE,
                  delay: QUEUE_DEFAULTS.BACKOFF_DELAY,
                },
                removeOnComplete: QUEUE_DEFAULTS.REMOVE_ON_COMPLETE,
                removeOnFail: QUEUE_DEFAULTS.REMOVE_ON_FAIL,
                ...moduleOptions.defaultJobOptions,
              },
            });

            queueService.registerQueue(queueName, queue);
          });

          return queueService;
        },
        inject: ['QUEUE_OPTIONS'],
      },
    ];

    return {
      module: QueueModule,
      imports: [ConfigModule],
      providers: queueProviders,
      exports: [QueueService],
    };
  }

  /**
   * Convenience method to register Queue module with ConfigService
   * Reads configuration from environment variables
   */
  static forRootWithConfig(): DynamicModule {
    return this.forRootAsync({
      useFactory: (configService: ConfigService): QueueModuleOptions => {
        const connection = {
          host: configService.get<string>('REDIS_HOST') ?? 'localhost',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB') ?? 0,
        };

        const concurrency =
          configService.get<number>('QUEUE_CONCURRENCY') ??
          QUEUE_DEFAULTS.CONCURRENCY;

        return {
          connection,
          concurrency,
        };
      },
      inject: [ConfigService],
    });
  }

  /**
   * Create queue providers
   * @param connection - Redis connection options
   * @param options - Queue module options
   */
  private static createQueueProviders(
    connection: ConnectionOptions,
    options: QueueModuleOptions,
  ): Provider[] {
    const providers: Provider[] = [];

    // Create a provider that initializes all queues
    providers.push({
      provide: QueueService,
      useFactory: () => {
        const queueService = new QueueService();

        // Create queues for each defined queue name
        Object.values(QUEUE_NAMES).forEach((queueName) => {
          const queue = new Queue(queueName, {
            connection,
            ...options.defaultQueueOptions,
            defaultJobOptions: {
              attempts: QUEUE_DEFAULTS.ATTEMPTS,
              backoff: {
                type: QUEUE_DEFAULTS.BACKOFF_TYPE,
                delay: QUEUE_DEFAULTS.BACKOFF_DELAY,
              },
              removeOnComplete: QUEUE_DEFAULTS.REMOVE_ON_COMPLETE,
              removeOnFail: QUEUE_DEFAULTS.REMOVE_ON_FAIL,
              ...options.defaultJobOptions,
            },
          });

          queueService.registerQueue(queueName, queue);
        });

        return queueService;
      },
    });

    return providers;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    // Close all workers
    await Promise.all(
      QueueModule.workers.map(async (worker) => {
        await worker.close();
      }),
    );

    QueueModule.workers = [];
  }
}
