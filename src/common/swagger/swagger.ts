import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CAP3 API')
    .setDescription('CAP3 API 문서 (Google OAuth + Kakao OAuth + 공통 응답 규격)')
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
