import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import type { JobsOptions } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queues: Map<string, Queue> = new Map();

  /**
   * Register a queue instance
   * @param name - Queue name
   * @param queue - Queue instance
   */
  registerQueue(name: string, queue: Queue): void {
    if (this.queues.has(name)) {
      this.logger.warn(`Queue ${name} is already registered`);
      return;
    }
    this.queues.set(name, queue);
    this.logger.log(`Queue ${name} registered`);
  }

  /**
   * Get a registered queue instance
   * @param name - Queue name
   */
  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  /**
   * Add a job to a queue
   * @param queueName - Target queue name
   * @param jobName - Job name
   * @param data - Job data
   * @param options - Job options
   */
  async addJob(
    queueName: string,
    jobName: string,
    data: unknown,
    options?: JobsOptions,
  ): Promise<Job> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    try {
      const job = await queue.add(jobName, data, options);
      this.logger.log(
        `Job ${jobName} added to queue ${queueName} with ID ${job.id}`,
      );
      return job;
    } catch (error) {
      this.logger.error(
        `Error adding job ${jobName} to queue ${queueName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gracefully close all queues
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing all queues...');
    await Promise.all(
      Array.from(this.queues.values()).map((queue) => queue.close()),
    );
    this.queues.clear();
    this.logger.log('All queues closed');
  }
}
