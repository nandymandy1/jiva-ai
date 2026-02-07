import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { QUEUE_NAMES, JOB_TYPES } from '@/queue/constants/queue.constants';
import { LlmService } from './llm.service';
import { WebhooksService } from '@/webhooks/webhooks.service';
import * as crypto from 'crypto';

@Processor(QUEUE_NAMES.LLM)
export class LlmProcessor extends WorkerHost {
  private readonly aiBaseUrl: string;
  private readonly logger = new Logger(LlmProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly llmService: LlmService,
    private readonly webhooksService: WebhooksService,
  ) {
    super();
    this.aiBaseUrl = this.llmService.getAiConfig();
  }

  async process(job: Job): Promise<any> {
    if (job.name !== JOB_TYPES.LLM.GENERATE) {
      return;
    }

    this.logger.log(`Processing LLM generation job ${job.id}`);
    const { prompt, metadata, clientId } = job.data;

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/generate`, {
          model: 'llama3',
          prompt,
          stream: false,
          ...metadata,
        }),
      );

      this.logger.log(`AI Response for job ${job.id} generated.`);

      // Send Webhooks
      if (clientId) {
        await this.sendWebhooks(clientId, {
          jobId: job.id,
          result: response.data,
          metadata,
        });
      }
      return response.data;
    } catch (error) {
      this.logger.error(`Error processing LLM job ${job.id}`, error);
      throw error;
    }
  }

  private async sendWebhooks(clientId: string, payload: any) {
    try {
      const webhooks =
        await this.webhooksService.getWebhooksByClientId(clientId);
      if (!webhooks || webhooks.length === 0) {
        return;
      }

      this.logger.log(
        `Sending webhooks for app ${clientId} (${webhooks.length} webhooks)`,
      );

      const payloadString = JSON.stringify(payload);

      for (const webhook of webhooks) {
        try {
          const signature = crypto
            .createHmac('sha256', webhook.webhookSecret)
            .update(payloadString)
            .digest('hex');

          await firstValueFrom(
            this.httpService.post(webhook.webhookUrl, payload, {
              headers: {
                'x-jiva-signature': signature,
                'Content-Type': 'application/json',
              },
            }),
          );
          this.logger.log(`Webhook sent to ${webhook.webhookUrl}`);
        } catch (error) {
          this.logger.error(
            `Failed to send webhook to ${webhook.webhookUrl}`,
            error.message,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error fetching webhooks for app ${clientId}`, error);
    }
  }
}
