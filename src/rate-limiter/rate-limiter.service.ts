import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/redis/redis.service';
import WHITE_LISTED_DOMAINS from './constants/white-listed-domains.constants';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  // Configuration
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly blockDurationMs: number;
  private readonly whitelistedSources: string[];

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    const whitelistStr = this.configService.get<string>(
      'RATE_LIMIT_WHITELIST_SOURCES',
      'localhost,127.0.0.1',
    );

    this.whitelistedSources = [
      ...WHITE_LISTED_DOMAINS,
      ...whitelistStr.split(',').map((s) => s.trim()),
    ];

    this.maxRequests = this.configService.get<number>(
      'RATE_LIMIT_MAX_REQUESTS',
      100,
    );

    this.windowMs = this.configService.get<number>(
      'RATE_LIMIT_WINDOW_MS',
      60000,
    );

    this.blockDurationMs = this.configService.get<number>(
      'RATE_LIMIT_BLOCK_DURATION_MS',
      300000,
    );
  }

  isWhitelisted(ip: string, origin?: string): boolean {
    const sources = [ip, origin].filter(Boolean) as string[];

    for (const source of sources) {
      if (this.whitelistedSources.some((allowed) => source.includes(allowed))) {
        return true;
      }
    }
    return false;
  }

  async checkLimit(
    ip: string,
  ): Promise<{ allowed: boolean; ttl?: number; retryAfter?: number }> {
    const blockKey = `blocked:${ip}`;
    const hitKey = `hits:${ip}`;

    const ttlBlocked = await this.redisService.ttl(blockKey);
    if (ttlBlocked > 0) {
      return { allowed: false, retryAfter: ttlBlocked };
    }

    const hits = await this.redisService.incr(hitKey);

    if (hits === 1) {
      await this.redisService.expire(hitKey, Math.ceil(this.windowMs / 1000));
    }

    if (hits > this.maxRequests) {
      this.logger.warn(
        `IP ${ip} exceeded rate limit. Blocking for ${this.blockDurationMs}ms`,
      );

      await this.redisService.set(blockKey, '1');
      await this.redisService.expire(
        blockKey,
        Math.ceil(this.blockDurationMs / 1000),
      );

      return {
        allowed: false,
        retryAfter: Math.ceil(this.blockDurationMs / 1000),
      };
    }

    // 4. Allowed
    const ttlHits = await this.redisService.ttl(hitKey);
    return { allowed: true, ttl: ttlHits };
  }
}
