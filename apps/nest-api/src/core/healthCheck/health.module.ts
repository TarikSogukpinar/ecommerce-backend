import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaService } from 'src/database/database.service';
import { HealthService } from './health.service';
import { PrismaHealthIndicator } from 'src/database/database.health';
import { RabbitMQHealthIndicator } from './rabbitMQHealth.service';

@Module({
  imports: [TerminusModule, HttpModule, RabbitMQHealthIndicator],
  controllers: [HealthController],
  providers: [
    HealthService,
    PrismaService,
    PrismaHealthIndicator,
    RabbitMQHealthIndicator,
  ],
})
export class HealthModule {}
