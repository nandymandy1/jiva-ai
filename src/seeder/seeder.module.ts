import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { App, AppSchema } from '@/models/app.model';
import { SeederService } from './seeder.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: App.name, schema: AppSchema }])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
