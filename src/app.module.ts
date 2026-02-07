import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    RedisModule.forRootWithConfig(),
    QueueModule.forRootWithConfig(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
