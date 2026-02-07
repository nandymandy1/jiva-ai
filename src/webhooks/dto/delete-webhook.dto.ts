import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteWebhookDto {
  @ApiProperty({
    description: 'The ID of the webhook to delete',
    example: '693874057479415784',
  })
  @IsMongoId()
  @IsNotEmpty()
  webhookId: string;
}
