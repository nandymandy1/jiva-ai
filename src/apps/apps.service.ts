import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App, AppDocument } from '@/models/app.model';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CreateAppDto } from './dto/create-app.dto';
import type { AppResponse } from './types/app.types';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class AppsService {
  private readonly CACHE_TTL = 3600;
  private readonly CACHE_PREFIX = 'app:profile:';

  constructor(
    @InjectModel(App.name) private appModel: Model<AppDocument>,
    private redisService: RedisService,
  ) {}

  async registerApp(createAppDto: CreateAppDto): Promise<AppResponse> {
    const clientId = uuidv4();
    const clientSecret = uuidv4();

    const newApp = await this.appModel.create({
      name: createAppDto.name,
      clientId,
      clientSecret,
    });

    return {
      ...newApp.toObject(),
      clientId,
      clientSecret,
    };
  }

  async validateApp(
    clientId: string,
    clientSecret: string,
  ): Promise<App | null> {
    const app = await this.appModel.findOne({ clientId }).lean();
    if (!app) {
      return null;
    }
    if (!app.isActive) {
      return null;
    }

    const isMatch = await bcrypt.compare(clientSecret, app.clientSecret);
    if (isMatch) {
      return app;
    }
    return null;
  }

  async getAppByClientId(clientId: string): Promise<App | null> {
    return this.appModel.findOne({ clientId }).lean();
  }

  async getAppProfile(clientId: string): Promise<AppResponse | null> {
    const cacheKey = `${this.CACHE_PREFIX}${clientId}`;
    const cachedApp = await this.redisService.getJson<AppResponse>(cacheKey);
    if (cachedApp) {
      return cachedApp;
    }

    const app = await this.appModel.findOne({ clientId }).lean();
    if (!app) return null;

    const appResponse: AppResponse = {
      name: app.name,
      clientId: app.clientId,
      isActive: app.isActive,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };

    await this.redisService.setJson(cacheKey, appResponse, this.CACHE_TTL);
    return appResponse;
  }

  async updateApp(
    clientId: string,
    updateData: Partial<App>,
  ): Promise<AppResponse | null> {
    const app = await this.appModel
      .findOneAndUpdate({ clientId }, updateData, {
        new: true,
      })
      .lean();
    if (!app) return null;

    await this.redisService.del(`${this.CACHE_PREFIX}${clientId}`);

    return {
      name: app.name,
      clientId: app.clientId,
      isActive: app.isActive,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  async deleteApp(clientId: string): Promise<boolean> {
    const app = await this.appModel.findOneAndDelete({ clientId }).lean();
    if (!app) return false;

    await this.redisService.del(`${this.CACHE_PREFIX}${clientId}`);
    return true;
  }
}
