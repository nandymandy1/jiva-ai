import { NestFactory } from '@nestjs/core';
import {
  type INestApplication,
  type Type,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MyLogger } from '../logger/logger.service';
import { json, urlencoded } from 'express';

const bootstrap = async (): Promise<void> => {
  const app: INestApplication = await NestFactory.create(AppModule as Type, {
    bufferLogs: true,
  });

  const logger = await app.resolve<MyLogger>(MyLogger);
  app.useLogger(logger);
  app.setGlobalPrefix('v1/api');

  app.use(
    json({
      limit: '50mb',
      type: ['application/json', 'text/plain'],
    }),
  );

  app.use(
    urlencoded({
      limit: '50mb',
      extended: true,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Jiva AI API')
    .setDescription('Jiva AI Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.APP_PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}/v1/api`);
  logger.log(`Swagger Docs available at: ${await app.getUrl()}/api/docs`);
};

export default bootstrap;
