import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AppsModule } from '@/apps/apps.module';
import { AuthModule } from '@/auth/auth.module';
import { DatabaseModule } from '@/database/database.module';
import { HealthModule } from '@/health/health.module';
import { LlmModule } from '@/llm/llm.module';
import { LoggerModule } from '@/logger/logger.module';
import { QueueModule } from '@/queue/queue.module';
import { RateLimiterGuard } from '@/rate-limiter/rate-limiter.guard';
import { RateLimiterModule } from '@/rate-limiter/rate-limiter.module';
import { RedisModule } from '@/redis/redis.module';
import { SeederModule } from '@/seeder/seeder.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LlmModule,
    AppsModule,
    AuthModule,
    HealthModule,
    LoggerModule,
    SeederModule,
    RateLimiterModule,
    DatabaseModule.forRootWithConfig(),
    RedisModule.forRootWithConfig(),
    QueueModule.forRootWithConfig(),
    WebhooksModule,
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
