import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginAppDto } from './dto/login-app.dto';
import { LoginResponse } from './types/auth.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('apps/login')
  @ApiOperation({ summary: 'Login for apps to get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'JWT token generated successfully.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginAppDto: LoginAppDto): Promise<LoginResponse> {
    const app = await this.authService.validateAppCredentials(
      loginAppDto.clientId,
      loginAppDto.clientSecret,
    );
    if (!app) {
      throw new UnauthorizedException('Invalid credentials or app is disabled');
    }
    return this.authService.login(app);
  }
}
