import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { SampleApps } from './data/apps';
import { App } from '@/models/app.model';
import * as crypto from 'crypto';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(App.name) private readonly appModel: Model<App>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv !== 'development') {
      this.logger.log('Seeder skipped: Not in development mode');
      return;
    }

    await this.seedApps();
  }

  private async seedApps() {
    this.logger.log('Checking if apps need seeding...');

    for (const appData of SampleApps) {
      const existingApp = await this.appModel.findOne({ name: appData.name });

      if (!existingApp) {
        const clientId = crypto.randomBytes(16).toString('hex');
        const clientSecret = crypto.randomBytes(32).toString('hex');

        await this.appModel.create({
          ...appData,
          clientId,
          clientSecret,
        });

        this.logger.log(`Created App: ${appData.name}`);
        this.logger.log(`  clientId: ${clientId}`);
        this.logger.log(`  clientSecret: ${clientSecret}`);
      } else {
        this.logger.log(`App already exists: ${appData.name}`);
        this.logger.log(`  clientId: ${existingApp.clientId}`);
        this.logger.log(`  clientSecret: ${existingApp.clientSecret}`);
      }
    }
  }
}
