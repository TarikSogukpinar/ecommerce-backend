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

import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusMetricsModule } from './utils/prometheus/prometheus.module';

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
    AuthModule,
    UserModule,
    PrismaModule,
    SwaggerModule,
    AddressModule,
    SupportModule,
    AdminModule,
    ScheduleModule.forRoot(),
    // PrometheusMetricsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
