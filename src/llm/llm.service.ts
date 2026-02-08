import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { OllamaTagsResponse } from './types/ollama.types';
import { AnalyseMedicinesDto } from './dto/analyse-medicines.dto';
import { MEDICINE_ANALYSIS_PROMPT } from './prompts/medicine-analysis.prompt';
import { JOB_TYPES, QUEUE_NAMES } from '@/queue/constants/queue.constants';
import { BaseDataResponse } from '@/common/types/base-response.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.LLM) private readonly llmQueue: Queue,
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

  async analyseMedicines(
    analyseMedicinesDto: AnalyseMedicinesDto,
  ): Promise<BaseDataResponse<{ aiJobId: string }>> {
    const job = await this.llmQueue.add(JOB_TYPES.LLM.GENERATE, {
      prompt: MEDICINE_ANALYSIS_PROMPT,
      images: analyseMedicinesDto.images ?? [],
      categories: analyseMedicinesDto.categories ?? [],
    });

    return {
      success: true,
      data: { aiJobId: job.id! },
      message: 'Analysis job queued successfully',
    };
  }
}
