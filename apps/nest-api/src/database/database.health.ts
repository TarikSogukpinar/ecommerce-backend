import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from './database.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const start = Date.now();
    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      const duration = Date.now() - start;

      return this.getStatus(key, true, { duration: `${duration}ms` });
    } catch (error) {
      throw new HealthCheckError(
        'PrismaHealthIndicator failed',
        this.getStatus(key, false),
      );
    }
  }
}
