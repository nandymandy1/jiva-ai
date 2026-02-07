import { Injectable } from '@nestjs/common';
import { HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redisService.ping();

      if (result === 'PONG') {
        return this.getStatus(key, true, {
          message: 'Redis is healthy',
        });
      }

      return this.getStatus(key, false, {
        message: 'Redis ping failed',
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
