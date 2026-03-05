# CAP3 Backend

## Stack
- NestJS
- Passport (Google, Kakao)
- Prisma
- Supabase PostgreSQL

## Required Env
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET_KEY`
- `KAKAO_REST_API_KEY`
- `SUPADB_PROJECT_URL`
- `SUPADB_PUBLISHABLE_KEY`
- `DATABSE_PASSWD_KEY` (Supabase DB password)
- `SUPADB_CONNECTION_MODE` (optional, default: `pooler`)
- `SUPADB_REGION` (optional, default: `ap-northeast-2`)
- `SUPADB_DB_HOST` (optional, explicit host override)
- `SUPADB_DB_PORT` (optional, default: `6543(pooler)` / `5432(direct)`)
- `SUPADB_DB_USER` (optional, default: `postgres.{project-ref}(pooler)` / `postgres(direct)`)
- `SUPADB_DB_NAME` (optional, default: `postgres`)
- `PORT`

## Run
```bash
pnpm install
pnpm prisma:generate
pnpm prisma:push
pnpm run lint
pnpm run check
pnpm run build
pnpm run start:dev
```

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
