import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '@/queue/queue.module';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { LlmProcessor } from './llm.processor';
import { WebhooksModule } from '@/webhooks/webhooks.module';

@Module({
  imports: [HttpModule, ConfigModule, QueueModule, WebhooksModule],
  controllers: [LlmController],
  providers: [LlmService, LlmProcessor],
  exports: [LlmService],
})
export class LlmModule {}
