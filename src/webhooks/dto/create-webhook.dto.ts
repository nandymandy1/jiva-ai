import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'The URL where the webhook events will be sent',
    example: 'https://example.com/webhooks/jiva-ai',
  })
  @IsUrl()
  @IsNotEmpty()
  webhookUrl: string;

  @ApiProperty({
    description: 'The secret used to sign the webhook payload',
    example: 'super-secret-key',
  })
  @IsString()
  @IsNotEmpty()
  webhookSecret: string;
}
