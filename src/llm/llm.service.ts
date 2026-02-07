import { JOB_TYPES, QUEUE_NAMES } from '@/queue/constants/queue.constants';
import { QueueService } from '@/queue/queue.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateGenerationDto } from './dto/create-generation.dto';
import type {
  GenerateResponse,
  OllamaTagsResponse,
} from './types/ollama.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getAiConfig(): string {
    const baseUrl = this.configService.get<string>(
      'AI_BASE_URL',
      'http://localhost:11434/api',
    );

    return baseUrl;
  }

  async checkHealth(): Promise<OllamaTagsResponse> {
    const baseUrl = this.getAiConfig();
    const { data } = await firstValueFrom(
      this.httpService.get<OllamaTagsResponse>(`${baseUrl}/tags`),
    );
    return data;
  }

  async generate(
    createGenerationDto: CreateGenerationDto,
    clientId: string,
  ): Promise<GenerateResponse> {
    const { prompt, metadata } = createGenerationDto;
    const jobId = `llm-${Date.now()}`;

    try {
      await this.queueService.addJob(
        QUEUE_NAMES.LLM,
        JOB_TYPES.LLM.GENERATE,
        {
          prompt,
          metadata,
          clientId,
        },
        {
          jobId,
          removeOnComplete: true,
        },
      );

      return {
        success: true,
        data: { jobId },
        message: 'Generation job queued successfully',
      };
    } catch (error) {
      this.logger.error('Failed to queue generation job', error);
      throw error;
    }
  }
}
