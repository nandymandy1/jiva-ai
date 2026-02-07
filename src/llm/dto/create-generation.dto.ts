import { ApiProperty } from '@nestjs/swagger';

export class CreateGenerationDto {
  @ApiProperty({
    example: 'Explain quantum computing to a 5 year old',
    description: 'The prompt to send to the AI model',
  })
  prompt: string;

  @ApiProperty({
    example: { userId: '123', context: 'educational' },
    description: 'Additional metadata for the request',
    required: false,
  })
  metadata?: any;
}
