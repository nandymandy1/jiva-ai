import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { QUEUE_NAMES, JOB_TYPES } from '@/queue/constants/queue.constants';
import { LlmService } from './llm.service';
import { LLM_MODELS_TYPES } from './constants/llm-models.constants';

@Processor(QUEUE_NAMES.LLM)
export class LlmProcessor extends WorkerHost {
  private readonly aiBaseUrl: string;
  private readonly logger = new Logger(LlmProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly llmService: LlmService,
  ) {
    super();
    this.aiBaseUrl = this.llmService.getAiConfig();
  }

  async process(
    job: Job<{
      prompt: string;
      images: string[];
      categories?: string[];
    }>,
  ): Promise<any> {
    if (job.name !== JOB_TYPES.LLM.GENERATE) return;

    this.logger.log(`Processing LLM generation job ${job.id}`);
    const { prompt, images } = job.data;
    this.logger.debug(
      `Sending to AI backend: ${JSON.stringify({ prompt, imagesCount: images?.length })}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/generate`, {
          prompt,
          stream: false,
          model: LLM_MODELS_TYPES.GRAINITE_3_2_VISION,
          categories: job.data.categories,
          images: images.map((img) =>
            img.replace(/^data:image\/[a-z]+;base64,/, ''),
          ),
        }),
      );

      this.logger.log(`AI Response for job ${job.id} generated.`);
      this.logger.log(`AI Response Data: ${JSON.stringify(response.data)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Error processing LLM job ${job.id}`, error);
      throw error;
    }
  }
}
