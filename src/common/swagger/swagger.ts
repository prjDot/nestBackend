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
    .setDescription(buildSwaggerDescription(appBaseUrl))
    .setVersion('1.0.0')
    .addTag('Health', 'Railway healthcheck 및 서버 준비 상태 확인')
    .addTag('Auth', 'Google/Kakao OAuth 로그인과 내부 Bearer 토큰 처리')
    .addTag('Users', '내 프로필과 사용자 환경설정')
    .addTag('Devices', '푸시 알림 디바이스 등록 및 상태 관리')
    .addTag('Search', '최근 검색 기록 저장 및 정리')
    .addTag('Stocks', '주식 시세 조회 및 52주 위치 분석')
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

function buildSwaggerDescription(appBaseUrl: string): string {
  const apiBaseUrl = `${trimTrailingSlash(appBaseUrl)}/api`;
  const docsJsonUrl = `${trimTrailingSlash(appBaseUrl)}/api/docs-json`;

  return [
    '실제 FE 연동 기준으로 보는 CAP3 API 문서입니다.',
    '',
    '## Base URL',
    `- 현재 환경 Base URL: \`${apiBaseUrl}\``,
    `- OpenAPI JSON: \`${docsJsonUrl}\``,
    '- 모든 엔드포인트는 `/api/{resource}` 규칙을 따릅니다.',
    '',
    '## Request Rule',
    '- Path Parameter: 리소스 식별자',
    '- Query Parameter: 목록 필터 / 정렬 / 조회 조건',
    '- Request Body: 생성 / 수정 payload',
    '- Header: 인증 정보와 부가 메타데이터',
    '- 요청 body는 `data`로 감싸지지 않습니다. DTO 필드만 그대로 전송합니다.',
    '- 날짜와 시간은 모두 ISO 8601 UTC 형식입니다. 예: `2026-03-05T08:40:21Z`',
    '',
    '## Auth Rule',
    '- 보호된 API는 `Authorization: Bearer <accessToken>` 헤더가 필요합니다.',
    '- OAuth 로그인 완료 후 callback 응답의 `data.accessToken`을 이후 요청에 사용합니다.',
    '',
    '## Success Envelope',
    '```json',
    '{',
    '  "ok": true,',
    '  "status": 200,',
    '  "message": "Request successful",',
    '  "data": {},',
    '  "meta": {',
    '    "requestId": "req_01HQX8M3F",',
    '    "timestamp": "2026-03-05T08:40:21Z"',
    '  }',
    '}',
    '```',
    '',
    '## Error Envelope',
    '```json',
    '{',
    '  "ok": false,',
    '  "status": 404,',
    '  "error": {',
    '    "code": "RESOURCE_NOT_FOUND",',
    '    "message": "리소스를 찾을 수 없습니다",',
    '    "detail": null',
    '  },',
    '  "meta": {',
    '    "requestId": "req_01HQX8M3F",',
    '    "timestamp": "2026-03-05T08:40:21Z"',
    '  }',
    '}',
    '```',
    '',
    '## Common Error Codes',
    '| Code | HTTP | 의미 |',
    '| --- | --- | --- |',
    '| `INVALID_REQUEST` | 400 | 잘못된 요청 파라미터 |',
    '| `VALIDATION_ERROR` | 400 | DTO 또는 비즈니스 검증 실패 |',
    '| `UNAUTHORIZED` | 401 | 인증 필요 또는 OAuth 실패 |',
    '| `INVALID_TOKEN` | 401 | Bearer 토큰이 유효하지 않음 |',
    '| `TOKEN_EXPIRED` | 401 | Bearer 토큰 만료 |',
    '| `PERMISSION_DENIED` | 403 | 권한 없음 |',
    '| `RESOURCE_NOT_FOUND` | 404 | 요청 리소스를 찾을 수 없음 |',
    '| `CONFLICT` | 409 | 중복 등록 또는 개수 제한 초과 |',
    '| `RATE_LIMIT_EXCEEDED` | 429 | 요청 제한 초과 |',
    '| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |',
    '| `DATABASE_UNAVAILABLE` | 503 | DB 연결 또는 준비 상태 실패 |',
    '',
    '## FE Notes',
    '- Swagger `Try it out`은 실제 응답 envelope 기준으로 예시를 제공합니다.',
    '- 목록 API의 정렬/필터 지원 범위는 각 엔드포인트 설명에 명시되어 있습니다.',
    '- 로컬 기본 CORS 허용 origin은 `http://localhost:3000`, `http://127.0.0.1:3000`이며 운영에서는 `CORS_ALLOWED_ORIGINS`로 제어합니다.'
  ].join('\n');
}

