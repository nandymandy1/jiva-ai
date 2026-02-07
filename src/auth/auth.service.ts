import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppsService } from '@/apps/apps.service';
import { AppResponse } from '@/apps/types/app.types';
import { LoginResponse, JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private appsService: AppsService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate app credentials.
   */
  async validateAppCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<AppResponse | null> {
    const app = await this.appsService.validateApp(clientId, clientSecret);
    if (app) {
      const appResponse: AppResponse = {
        name: app.name,
        clientId: app.clientId,
        isActive: app.isActive,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };

      return appResponse;
    }
    return null;
  }

  async validateAppByClientId(clientId: string): Promise<AppResponse | null> {
    const app = await this.appsService.getAppProfile(clientId);
    if (app && !app.isActive) {
      return null;
    }
    return app;
  }

  login(app: AppResponse): LoginResponse {
    if (!app.isActive) {
      throw new UnauthorizedException('App is disabled');
    }
    const payload: JwtPayload = { name: app.name, sub: app.clientId };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: 3600,
    };
  }
}
