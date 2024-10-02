import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './rabbitMQHealth.service';
import { PrismaHealthIndicator } from 'src/database/database.health';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealthService: PrismaHealthIndicator,
    private rabbitMQHealthService: RabbitMQHealthIndicator,
  ) {}

  @HealthCheck()
  async check() {
    return await this.health.check([
      async () => await this.prismaHealthService.isHealthy('database'),
      async () =>
        await this.http.pingCheck(
          'ping-check-api',
          'https://mock-api.tariksogukpinar.dev/nest/api/v1/health',
        ),
    ]);
  }
}
