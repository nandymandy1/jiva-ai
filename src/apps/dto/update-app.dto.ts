import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppDto {
  @ApiProperty({ description: 'The name of the application', required: false })
  name?: string;

  @ApiProperty({
    description: 'The active status of the application',
    required: false,
  })
  isActive?: boolean;
}
