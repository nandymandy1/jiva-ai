import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DatabaseModule } from '@/database/database.module';
import { HealthModule } from '@/health/health.module';
import { LlmModule } from '@/llm/llm.module';
import { LoggerModule } from '@/logger/logger.module';
import { QueueModule } from '@/queue/queue.module';
import { RateLimiterGuard } from '@/rate-limiter/rate-limiter.guard';
import { RateLimiterModule } from '@/rate-limiter/rate-limiter.module';
import { RedisModule } from '@/redis/redis.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LlmModule,
    HealthModule,
    LoggerModule,
    RateLimiterModule,
    DatabaseModule.forRootWithConfig(),
    RedisModule.forRootWithConfig(),
    QueueModule.forRootWithConfig(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
