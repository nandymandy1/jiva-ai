import type { JobsOptions, QueueOptions, WorkerOptions } from 'bullmq';
import type { InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

/**
 * Queue module configuration options
 */
export type QueueModuleOptions = {
  /**
   * Redis connection configuration
   */
  connection: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  };

  /**
   * Default options for all queues
   */
  defaultQueueOptions?: Partial<QueueOptions>;

  /**
   * Default options for all workers
   */
  defaultWorkerOptions?: Partial<WorkerOptions>;

  /**
   * Default options for all jobs
   */
  defaultJobOptions?: Partial<JobsOptions>;

  /**
   * Number of concurrent job processors
   * @default 5
   */
  concurrency?: number;
};

/**
 * Async factory function for Queue module options
 */
export type QueueModuleAsyncOptions = {
  /**
   * Factory function to create Queue module options
   */
  useFactory: (
    ...args: unknown[]
  ) => Promise<QueueModuleOptions> | QueueModuleOptions;

  /**
   * Dependencies to inject into the factory function
   */
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
};

/**
 * Job data type for type safety
 */
export type JobData = {
  [key: string]: unknown;
};

/**
 * Email job data
 */
export type EmailJobData = JobData & {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, unknown>;
};

/**
 * Notification job data
 */
export type NotificationJobData = JobData & {
  userId: string;
  title: string;
  message: string;
  type: 'push' | 'sms' | 'email';
  metadata?: Record<string, unknown>;
};

/**
 * User sync job data
 */
export type UserSyncJobData = JobData & {
  userId: string;
  action: 'sync' | 'delete';
};

/**
 * Tenant provisioning job data
 */
export type TenantJobData = JobData & {
  tenantId: string;
  action: 'provision' | 'cleanup';
  metadata?: Record<string, unknown>;
};
