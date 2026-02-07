/**
 * Queue Module Constants
 * Defines queue names, job types, and default configurations
 */

/**
 * Injection token for BullMQ queue instances
 */
export const QUEUE_PROVIDER = 'QUEUE_PROVIDER';

/**
 * Injection token for queue module options
 */
export const QUEUE_MODULE_OPTIONS = 'QUEUE_MODULE_OPTIONS';

/**
 * Queue names used in the application
 */
export const QUEUE_NAMES = {
  /**
   * Queue for email-related jobs
   */
  EMAIL: 'jiva-ai-email',

  /**
   * Queue for notification jobs
   */
  NOTIFICATION: 'jiva-ai-notification',

  /**
   * Queue for user-related background tasks
   */
  USER: 'jiva-ai-user',

  /**
   * Queue for tenant-related background tasks
   */
  TENANT: 'jiva-ai-tenant',
} as const;

/**
 * Job type constants
 */
export const JOB_TYPES = {
  /**
   * Email job types
   */
  EMAIL: {
    SEND_VERIFICATION: 'send-verification-email',
    SEND_PASSWORD_RESET: 'send-password-reset-email',
    SEND_WELCOME: 'send-welcome-email',
  },

  /**
   * Notification job types
   */
  NOTIFICATION: {
    SEND_PUSH: 'send-push-notification',
    SEND_SMS: 'send-sms-notification',
  },

  /**
   * User job types
   */
  USER: {
    SYNC_PROFILE: 'sync-user-profile',
    DELETE_USER_DATA: 'delete-user-data',
  },

  /**
   * Tenant job types
   */
  TENANT: {
    PROVISION: 'provision-tenant',
    CLEANUP: 'cleanup-tenant-data',
  },
} as const;

/**
 * Default queue options
 */
export const QUEUE_DEFAULTS = {
  /**
   * Default number of job processing attempts
   */
  ATTEMPTS: 3,

  /**
   * Default backoff delay in milliseconds
   */
  BACKOFF_DELAY: 5000,

  /**
   * Default backoff type
   */
  BACKOFF_TYPE: 'exponential' as const,

  /**
   * Default number of concurrent workers
   */
  CONCURRENCY: 5,

  /**
   * Default job removal on completion
   */
  REMOVE_ON_COMPLETE: {
    age: 24 * 3600, // 24 hours in seconds
    count: 1000, // Keep last 1000 jobs
  },

  /**
   * Default job removal on failure
   */
  REMOVE_ON_FAIL: {
    age: 7 * 24 * 3600, // 7 days in seconds
  },
} as const;
