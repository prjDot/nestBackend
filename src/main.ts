import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { AppLoggerService } from './common/logger/app-logger.service';
import { normalizePathMiddleware } from './common/middleware/normalize-path.middleware';
import { requestContextMiddleware } from './common/middleware/request-context.middleware';
import { setupSwagger } from './common/swagger/swagger';
import {
  resolveAppBaseUrl,
  resolveCorsOrigins,
  trimTrailingSlash
} from './common/url/app-url.util';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLoggerService);
  const configService = app.get(ConfigService);
  const readValue = (key: string): string | undefined => configService.get<string>(key);
  const corsOrigins = resolveCorsOrigins(readValue);
  const appBaseUrl = resolveAppBaseUrl(readValue);
  const apiBaseUrl = `${trimTrailingSlash(appBaseUrl)}/api`;
  app.useLogger(logger);
  app.enableShutdownHooks();

  app.use(normalizePathMiddleware);
  app.use(requestContextMiddleware);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalInterceptors(
    new HttpLoggingInterceptor(logger),
    new ApiResponseInterceptor()
  );
  app.useGlobalFilters(new ApiExceptionFilter(logger));

  setupSwagger(app);

  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port);

  logger.info(`CAP3 API running on ${apiBaseUrl}`, 'Bootstrap');
  logger.info(
    `Swagger docs: ${trimTrailingSlash(appBaseUrl)}/api/docs`,
    'Bootstrap'
  );
  logger.debug(`CORS allowed origins: ${corsOrigins.join(', ')}`, 'Bootstrap');
}

void bootstrap();
