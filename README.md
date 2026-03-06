# CAP3 Backend

## Stack
- NestJS
- Passport (Google, Kakao)
- Prisma
- Neon PostgreSQL
- Railway

## Required Env
- `DATABASE_URL` (Neon PostgreSQL connection string)
- `NODE_ENV` (optional, default: `development`)
- `APP_BASE_URL` (optional, e.g. `https://api.example.com`)
- `CORS_ALLOWED_ORIGINS` (optional, comma-separated origins)
- `AUTH_TOKEN_SECRET`
- `AUTH_TOKEN_EXPIRES_IN_SEC` (optional, default: `604800`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET_KEY`
- `KAKAO_REST_API_KEY`
- `KAKAO_CLIENT_SECRET_KEY` (optional, required when Kakao client secret is enabled)
- `GOOGLE_CALLBACK_URL` (optional, overrides auto-generated callback URL)
- `KAKAO_CALLBACK_URL` (optional, overrides auto-generated callback URL)
- `PORT` (Railway provides this automatically)

## Run
```bash
pnpm install
pnpm prisma:generate
npx prisma db push
pnpm run lint
pnpm run check
pnpm run build
pnpm run start:dev
```

## Railway Deploy
1. Railway에서 이 GitHub 저장소를 연결하거나 `railway up`으로 서비스에 연결합니다.
2. 서비스 설정에 public domain을 생성합니다.
3. Railway Variables에 최소 아래 값을 설정합니다.
   - `DATABASE_URL`
   - `AUTH_TOKEN_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET_KEY`
   - `KAKAO_REST_API_KEY`
   - `KAKAO_CLIENT_SECRET_KEY` (사용 시)
   - `CORS_ALLOWED_ORIGINS`
4. `APP_BASE_URL`은 선택 사항입니다. 없으면 앱이 Railway의 `RAILWAY_PUBLIC_DOMAIN`을 사용해 Swagger/OAuth callback URL을 계산합니다.
5. Google/Kakao OAuth 콘솔 redirect URI를 실제 Railway 도메인 기준으로 등록합니다.
   - `https://<your-domain>/api/auth/google/callback`
   - `https://<your-domain>/api/auth/kakao/callback`
6. 배포 후 아래 URL로 확인합니다.
   - Swagger UI: `https://<your-domain>/api/docs`
   - OpenAPI JSON: `https://<your-domain>/api/docs-json`
   - Health: `https://<your-domain>/api/health`
   - Readiness: `https://<your-domain>/api/health/ready`

## DB Model (ERD)
- `users` table (`prisma/schema.prisma`)
  - `id` (UUID, PK)
  - `provider` (GOOGLE, KAKAO)
  - `provider_id`
  - `email`
  - `nickname`
  - `name`
  - `given_name`
  - `family_name`
  - `picture`
  - `locale`
  - `email_verified`
  - `profile` (JSON)
  - `last_login_at`
  - `created_at`
  - `updated_at`
  - unique: `(provider, provider_id)`
