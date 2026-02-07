import { ApiProperty } from '@nestjs/swagger';

export class LoginAppDto {
  @ApiProperty({
    description: 'The client ID of the application',
    example: 'uuid-string',
  })
  clientId: string;

  @ApiProperty({
    description: 'The client secret of the application',
    example: 'secret-string',
  })
  clientSecret: string;
}
