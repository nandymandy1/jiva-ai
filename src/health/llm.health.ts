import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { LlmService } from '@/llm/llm.service';

@Injectable()
export class LlmHealthIndicator extends HealthIndicator {
  constructor(private readonly llmService: LlmService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const data = await this.llmService.checkHealth();

      return this.getStatus(key, true, {
        message: 'AI backend is healthy',
        details: data,
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: 'AI backend is unreachable',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
