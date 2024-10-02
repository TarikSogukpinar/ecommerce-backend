import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import * as amqp from 'amqp-connection-manager';

export class RabbitMQHealthIndicator extends HealthIndicator {
  private readonly connection = amqp.connect([
    'amqp://ledun:testledun2216@78.111.111.77:5672',
  ]);

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isConnected = this.connection.isConnected();
    const result = this.getStatus(key, isConnected);

    if (isConnected) {
      return result;
    }
    throw new HealthCheckError('RabbitMQ is not responding', result);
  }
}
