import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { SwaggerModule } from './core/swagger/swagger.module';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';
import { SupportModule } from './support/support.module';
import { AdminModule } from './admin/admin.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CacheModule } from '@nestjs/cache-manager';
import { HealthModule } from './core/healthCheck/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV;
        const envFilePath =
          env === 'production'
            ? '.env.production'
            : env === 'staging'
              ? '.env.staging'
              : '.env.development';
        console.log(`Loading environment variables from ${envFilePath}`);
        return envFilePath;
      })(),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    SwaggerModule,
    AddressModule,
    SupportModule,
    AdminModule,
    HealthModule,
    CacheModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
