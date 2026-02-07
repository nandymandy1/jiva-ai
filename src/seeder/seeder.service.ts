import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App } from '@/models/app.model';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(@InjectModel(App.name) private readonly appModel: Model<App>) {}

  async seed() {
    await this.seedApps();
  }

  private async seedApps() {
    const appsCount = await this.appModel.countDocuments();
    if (appsCount > 0) {
      this.logger.log('Apps already seeded');
      return;
    }

    const apps = [
      {
        name: 'Jiva Flow Frontend',
        clientId: 'jiva-flow-web',
        clientSecret: 'jiva-flow-secret',
      },
      {
        name: 'Inventory App',
        clientId: 'inventory-app',
        clientSecret: 'inventory-secret',
      },
    ];

    for (const appData of apps) {
      const app = new this.appModel(appData);
      await app.save();
      this.logger.log(`Seeded App: ${app.name} (ClientId: ${app.clientId})`);
    }
  }
}
