import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { QUEUE_NAMES, JOB_TYPES } from '@/queue/constants/queue.constants';
import { LlmService } from './llm.service';

@Processor(QUEUE_NAMES.LLM)
export class LlmProcessor extends WorkerHost {
  private readonly logger = new Logger(LlmProcessor.name);
  private readonly aiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly llmService: LlmService,
  ) {
    super();
    const config = this.llmService.getAiConfig();
    this.aiBaseUrl = config.baseUrl;
  }

  async process(job: Job): Promise<any> {
    if (job.name !== JOB_TYPES.LLM.GENERATE) {
      return;
    }
    this.logger.log(`Processing LLM generation job ${job.id}`);
    const { prompt, metadata } = job.data;

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/generate`, {
          model: 'llama3',
          prompt,
          stream: false,
          ...metadata,
        }),
      );

      this.logger.log(`AI Response for job ${job.id}:`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Error processing LLM job ${job.id}`, error);
      throw error;
    }
  }
}
