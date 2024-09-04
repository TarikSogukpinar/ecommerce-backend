import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/database.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from '../core/token/token.module';
import { PrismaModule } from 'src/database/database.module';
import { PassportModule } from '@nestjs/passport';
import { HashingModule } from 'src/utils/hashing/hashing.module';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    HashingModule,
    TokenModule,
    PrismaModule,
    HttpModule,
    HashingModule,
    ClientsModule.register([
      {
        name: 'USER_SERVICE', // RabbitMQ istemcisini buraya ekliyoruz
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://ledun:testledun2216@78.111.111.77:5672'],
          queue: 'token_created_queue',
          queueOptions: {
            durable: true, // Kuyruk kalıcı olmalı
          },
          // Burada exchange tanımlamadığınız için RabbitMQ doğrudan kuyruk ile çalışır.
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, HashingService],
  exports: [AuthService],
})
export class AuthModule {}
