import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CAP3 API')
    .setDescription('NestJS API 문서 (Google OAuth + 공통 응답 규격)')
    .setVersion('1.0.0')
    .addServer('http://localhost:4000', 'local')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CAP3 API Docs',
    swaggerOptions: {
      persistAuthorization: true
    }
  });
}
