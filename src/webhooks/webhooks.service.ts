import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook } from '@/models/webhook.model';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import type { BaseWebhookResponse } from './types/base-response.type';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(Webhook.name) private readonly webhookModel: Model<Webhook>,
  ) {}

  async registerWebhook(
    createWebhookDto: CreateWebhookDto,
    clientId: string,
  ): Promise<BaseWebhookResponse> {
    const checkWebhook = await this.webhookModel.findOne({
      clientId,
      webhookUrl: createWebhookDto.webhookUrl,
    });
    if (checkWebhook) {
      throw new ConflictException('Webhook already exists');
    }
    const webhook = await this.webhookModel.create(createWebhookDto);
    this.logger.log(
      `Webhook registered for App ${clientId}: ${createWebhookDto.webhookUrl}`,
    );
    return {
      success: true,
      data: { _id: webhook._id.toString() },
      message: 'Webhook registered successfully',
    };
  }

  async getWebhooksByClientId(clientId: string) {
    return this.webhookModel.find({ clientId, isActive: true }).lean();
  }

  async deleteWebhook(
    webhookId: string,
    clientId: string,
  ): Promise<BaseWebhookResponse> {
    const webhook = await this.webhookModel.findOneAndDelete({
      _id: webhookId,
      clientId,
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    this.logger.log(
      `Webhook deleted for App ${clientId}: ${webhook.webhookUrl}`,
    );

    return {
      success: true,
      data: { _id: webhook._id.toString() },
      message: 'Webhook deleted successfully',
    };
  }
}
