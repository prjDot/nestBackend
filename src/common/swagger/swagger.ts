import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CAP3 API')
    .setDescription('주식 분석 및 시세 조회 API')
    .setVersion('1.0.0')
    .addServer('http://localhost:8080', 'local')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CAP3 API Docs',
    swaggerOptions: {
      persistAuthorization: true
    }
  });
}
