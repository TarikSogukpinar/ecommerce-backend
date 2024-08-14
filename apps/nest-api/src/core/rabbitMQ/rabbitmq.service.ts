import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL')],
        queue: 'main_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    this.client
      .connect()
      .then(() => {
        console.log('RabbitMQ connection established');
      })
      .catch((err) => {
        console.error('RabbitMQ connection failed', err);
      });
  }

  getClient(): ClientProxy {
    return this.client;
  }

  async sendMessage(pattern: string, message: any): Promise<any> {
    return this.client.send(pattern, message).toPromise();
  }

  async emitEvent(pattern: string, message: any): Promise<void> {
    return this.client.emit(pattern, message).toPromise();
  }
}
