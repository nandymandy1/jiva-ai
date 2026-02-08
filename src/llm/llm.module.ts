import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '@/queue/queue.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '@/queue/constants/queue.constants';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { LlmProcessor } from './llm.processor';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    QueueModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.LLM,
    }),
  ],
  controllers: [LlmController],
  providers: [LlmService, LlmProcessor],
  exports: [LlmService],
})
export class LlmModule {}
