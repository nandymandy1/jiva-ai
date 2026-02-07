import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthRequest } from '@/common/types/request.types';
import { DeleteWebhookDto } from './dto/delete-webhook.dto';
import { BaseWebhookResponse } from './types/base-response.type';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Register a new webhook',
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook registered successfully.',
  })
  async registerWebhook(
    @Request() req: AuthRequest,
    @Body() createWebhookDto: CreateWebhookDto,
  ): Promise<BaseWebhookResponse> {
    const requestingClientId = req.user.clientId;
    return await this.webhooksService.registerWebhook(
      createWebhookDto,
      requestingClientId,
    );
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a webhook',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook deleted successfully.',
  })
  async deleteWebhook(
    @Request() req: AuthRequest,
    @Param() deleteWebhookDto: DeleteWebhookDto,
  ): Promise<BaseWebhookResponse> {
    const requestingClientId = req.user.clientId;
    return await this.webhooksService.deleteWebhook(
      deleteWebhookDto.webhookId,
      requestingClientId,
    );
  }
}
