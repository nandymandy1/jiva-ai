import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { App, AppSchema } from '@/models/app.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: App.name, schema: AppSchema }])],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
