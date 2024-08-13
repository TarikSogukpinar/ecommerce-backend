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
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
