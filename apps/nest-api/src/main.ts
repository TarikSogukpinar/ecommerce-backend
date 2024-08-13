//Custom Modules, Packages, Configs, etc.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

//pnpm packages
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import validationOptions from './utils/validate/validation-options';
import { SwaggerService } from './core/swagger/swagger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(
    configService.get<string>('API_GLOBAL_PREFIX', { infer: true }),
  );
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(helmet());
  app.use(hpp());
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const swaggerService = app.get(SwaggerService);
  swaggerService.setupSwagger(app);
  const PORT = configService.get<string>('API_PORT', { infer: true });

  app.enableCors({
    origin: [
      configService.get<string>('CORS_ORIGIN', { infer: true }),
      configService.get<string>('CORS_ORIGIN_LOCAL', { infer: true }),
    ],
    credentials: true,
  });

  await app.listen(
    configService.get<number>('API_PORT', { infer: true }),
    '0.0.0.0',
  );

  Logger.log(`🚀 Application is running on: http://localhost:${PORT}/`);
}
void bootstrap();
