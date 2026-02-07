import { ApiProperty } from '@nestjs/swagger';

export class CreateAppDto {
  @ApiProperty({
    description: 'The name of the application',
    example: 'My Awesome App',
  })
  name: string;
}
