import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health';
import { LlmHealthIndicator } from './llm.health';
import { LlmModule } from '@/llm/llm.module';

@Module({
  imports: [TerminusModule, LlmModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, LlmHealthIndicator],
})
export class HealthModule {}
