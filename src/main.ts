import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { AppLoggerService } from './common/logger/app-logger.service';
import { normalizePathMiddleware } from './common/middleware/normalize-path.middleware';
import { requestContextMiddleware } from './common/middleware/request-context.middleware';
import { setupSwagger } from './common/swagger/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  app.use(normalizePathMiddleware);
  app.use(requestContextMiddleware);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

  logger.info(`CAP3 API running on http://localhost:${port}/api`, 'Bootstrap');
  logger.info(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}

void bootstrap();
