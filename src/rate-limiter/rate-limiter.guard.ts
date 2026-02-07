import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { Request } from 'express';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);

  constructor(private readonly rateLimiterService: RateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { url } = request;

    // Determine client source details
    const clientIp =
      (request.headers['x-forwarded-for'] as string) || request.ip || 'unknown';
    const origin = request.headers['origin'] || request.headers['host'];

    // 1. Check Whitelist (Source based)
    if (this.rateLimiterService.isWhitelisted(clientIp, origin)) {
      return true;
    }

    // 2. Check Rate Limit
    const result = await this.rateLimiterService.checkLimit(clientIp);

    if (!result.allowed) {
      this.logger.warn(`Rate limit exceeded for IP: ${clientIp} on ${url}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `You have been rate limited. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
