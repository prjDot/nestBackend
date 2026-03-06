import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  resolveAppBaseUrl,
  trimTrailingSlash
} from '../url/app-url.util';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const appBaseUrl = resolveAppBaseUrl((key) => configService.get<string>(key));
  const localBaseUrl = 'http://localhost:8080';

  let builder = new DocumentBuilder()
    .setTitle('CAP3 API')
    .setDescription('')
    .setVersion('1.0.0')
    .addTag('Health', 'Railway healthcheck 및 서버 준비 상태 확인')
    .addTag('Auth', 'Google/Kakao OAuth 로그인과 내부 Bearer 토큰 처리')
    .addTag('Users', '내 프로필과 사용자 환경설정')
    .addTag('Devices', '푸시 알림 디바이스 등록 및 상태 관리')
    .addTag('Search', '최근 검색 기록 저장 및 정리')
    .addTag('Instruments', '종목 검색 및 마스터 정보')
    .addTag('Quotes', '종목 시세 조회')
    .addTag('Analytics', '종목 가격 분석')
    .addTag('Watchlist', '관심 종목 관리')
    .addTag('Alerts', '가격 알림 생성, 조회, 수정, 삭제')
    .addTag('Notifications', '알림 기록 조회와 읽음 처리')
    .addTag('Stats', '사용자 개인 통계 요약')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token'
      },
      'bearer'
    );

  builder = builder.addServer(appBaseUrl, 'current environment');

  if (trimTrailingSlash(appBaseUrl) !== localBaseUrl) {
    builder = builder.addServer(localBaseUrl, 'local development');
  }

  const config = builder.build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_, methodKey) => methodKey
  });

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CAP3 API Docs',
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      docExpansion: 'list',
      displayRequestDuration: true,
      defaultModelsExpandDepth: -1,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    }
  });
}

