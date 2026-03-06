# CAP3 Backend

## Stack
- **Framework**: NestJS 10.4.16
- **Database**: Neon PostgreSQL (via Prisma)
- **Cache**: Redis (ioredis)
- **Authentication**: Passport (Google OAuth, Kakao OAuth)
- **Deployment**: Railway
- **API Documentation**: Swagger

## Features

### Authentication
- Google OAuth 2.0
- Kakao OAuth 2.0
- Bearer Token Authentication

### Stock Analyzer
- 단일 종목 조회: `GET /api/stocks/{symbol}`
- 다중 종목 조회: `GET /api/stocks?symbols=AAPL,005930,카카오`
- 52주 기준 위치(%) 분석
- Mock 데이터 (30개 종목: US 15개 + KR 15개)
- Redis 캐싱 (TTL: 60초)

### User Management
- 사용자 프로필 조회/수정
- 기기 관리
- 검색 기록
- 관심 종목 (Watchlist)

### Alerts & Notifications
- 주가 알림 설정
- 알림 발송 시스템

### Statistics
- 사용자 통계

## Setup

### Install Dependencies
```bash
pnpm install
```

### Required Environment Variables
- `DATABASE_URL` - Neon PostgreSQL 연결 문자열
- `REDIS_URL` - Redis 연결 URL
- `AUTH_TOKEN_SECRET` - JWT 시크릿 키
- `GOOGLE_CLIENT_ID` - Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET_KEY` - Google OAuth 시크릿
- `KAKAO_REST_API_KEY` - Kakao REST API 키
- `NODE_ENV` (optional, default: development)
- `PORT` (optional, default: 8080)
- `APP_BASE_URL` (optional)
- `CORS_ALLOWED_ORIGINS` (optional)

자세한 환경변수는 `.env.example` 참고

### Database Setup
```bash
pnpm prisma:generate
npx prisma db push
```

### Build
```bash
pnpm run build
```

### Run
```bash
# Development (watch mode)
pnpm run start:dev

# Production
pnpm run start

# Lint
pnpm run lint

# Format
pnpm run format
```

## Railway Deploy
1. Railway에서 이 GitHub 저장소를 연결하거나 `railway up`으로 서비스에 연결합니다.
2. 서비스 설정에 public domain을 생성합니다.
3. Railway Variables에 최소 아래 값을 설정합니다:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `AUTH_TOKEN_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET_KEY`
   - `KAKAO_REST_API_KEY`
   - `CORS_ALLOWED_ORIGINS`
4. `APP_BASE_URL`은 선택 사항입니다. 없으면 앱이 Railway의 `RAILWAY_PUBLIC_DOMAIN`을 사용해 Swagger/OAuth callback URL을 계산합니다.
5. Google/Kakao OAuth 콘솔 redirect URI를 실제 Railway 도메인 기준으로 등록합니다:
   - `https://<your-domain>/api/auth/google/callback`
   - `https://<your-domain>/api/auth/kakao/callback`
6. 배포 후 아래 URL로 확인합니다:
   - Swagger UI: `https://<your-domain>/api/docs`
   - Health: `https://<your-domain>/api/health`

<<<<<<< HEAD
## API Documentation
=======
- [ ] Redis 실제 연동 (캐싱)
- [ ] 알림 기능 (24시간 중복 방지)
- [ ] 위시리스트 기능
- [ ] 사용자 인증 시스템
- [ ] NeonDB PostgreSQL 통합
- [ ] 히스토리 및 차트 데이터
>>>>>>> 7dcfa2c37a6c46071d29964304c34f96e0b20938

Swagger UI: http://localhost:8080/api/docs

### Stock Analyzer

**단일 종목 조회**
```
GET /api/stocks/{symbol}
```
- Path: `symbol` - AAPL / 005930 / 삼성전자
- Query: `userId` (선택)

**다중 종목 조회**
```
GET /api/stocks?symbols=AAPL,005930,카카오
```
- Query: `symbols` - 종목 목록 (쉼표 구분, 최대 50개)
- Query: `userId` (선택)

**지원 종목**
- **US**: AAPL, TSLA, AMZN, NVDA, MSFT, GOOGL, META, NFLX, AMD, INTC, QCOM, BA, DIS, UBER, COIN
- **KR**: 삼성전자(005930), SK하이닉스(000660), LG에너지솔루션(373220), 네이버(035420), 카카오(035720) 등

**검색 방식**
- 티커: AAPL, TSLA
- 종목코드: 005930, 035720
- 종목명: 삼성전자, 카카오

## DB Model (ERD)

`prisma/schema.prisma` 참고

**Main Tables:**
- `users` - 사용자 정보
- `devices` - 기기 정보
- `search_history` - 검색 기록
- `watchlist` - 관심 종목
- `alerts` - 알림 설정
- `notifications` - 알림 이력
- `stats` - 통계

