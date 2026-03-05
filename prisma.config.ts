import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: resolveDatabaseUrlFromEnv(process.env)
  },
  migrations: {
    path: 'prisma/migrations'
  }
});

function resolveDatabaseUrlFromEnv(env: NodeJS.ProcessEnv): string {
  const explicitDatabaseUrl = env.DATABASE_URL;
  if (explicitDatabaseUrl) {
    return explicitDatabaseUrl;
  }

  const projectUrl =
    env.DATABASE_URL ??
    env.PROJECT_URL ??
    env.SUPABASE_PROJECT_URL ??
    env.SUPADB_PROJECT_URL;
  const publishableKey =
    env.DATABASE_PUBLISHABLE_KEY ??
    env['DATABASE_PUBLISHABLE KEY'] ??
    env.SUPABASE_KEY ??
    env.SUPABASE_PUBLISHABLE_KEY ??
    env.SUPADB_PUBLISHABLE_KEY ??
    env.ANON_KEY;
  const password =
    env.DATABSE_PASSWD_KEY ??
    env.DATABASE_PASSWD_KEY ??
    env.SUPADB_DB_PASSWORD ??
    env.DATABASE_PASSWORD;

  if (!projectUrl || !publishableKey || !password) {
    throw new Error(
      'DATABASE_URL or (PROJECT_URL, DATABASE_PUBLISHABLE_KEY, DATABSE_PASSWD_KEY) must be configured.'
    );
  }

  const projectRef = extractProjectRef(projectUrl);
  const mode = (env.SUPADB_CONNECTION_MODE ?? 'pooler').toLowerCase();
  const region = env.SUPADB_REGION ?? env.SUPADB_POOLER_REGION ?? 'ap-northeast-2';
  const host =
    env.SUPADB_DB_HOST ??
    (mode === 'direct'
      ? `db.${projectRef}.supabase.co`
      : `aws-0-${region}.pooler.supabase.com`);
  const port =
    env.SUPADB_DB_PORT ??
    (mode === 'direct' ? '5432' : '6543');
  const user =
    env.SUPADB_DB_USER ??
    (mode === 'direct' ? 'postgres' : `postgres.${projectRef}`);
  const dbName = env.SUPADB_DB_NAME ?? 'postgres';
  const dbSchema = env.SUPADB_DB_SCHEMA ?? 'public';
  const sslMode = (env.SUPADB_SSL_MODE ?? 'require').toLowerCase();
  const useLibpqCompat = toBoolean(env.SUPADB_USE_LIBPQ_COMPAT, true);
  const query = new URLSearchParams();
  query.set('schema', dbSchema);
  query.set('sslmode', sslMode);
  if (useLibpqCompat) {
    query.set('uselibpqcompat', 'true');
  }

  return (
    `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}` +
    `@${host}:${port}/${dbName}?${query.toString()}`
  );
}

function extractProjectRef(projectUrl: string): string {
  const hostnameParts = new URL(projectUrl).hostname.split('.');
  const projectRef = hostnameParts[0];

  if (!projectRef) {
    throw new Error('PROJECT_URL is invalid.');
  }

  return projectRef;
}

function toBoolean(input: string | undefined, defaultValue: boolean): boolean {
  if (input === undefined) {
    return defaultValue;
  }

  const normalized = input.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  return defaultValue;
}
