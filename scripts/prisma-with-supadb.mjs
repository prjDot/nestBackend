import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/prisma-with-supadb.mjs <prisma args>');
  process.exit(1);
}

const databaseUrl = resolveDatabaseUrlFromEnv(process.env);

const prismaProcess = spawn(
  'pnpm',
  ['prisma', ...args],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    }
  }
);

prismaProcess.on('exit', (code) => {
  process.exit(code ?? 1);
});

function resolveDatabaseUrlFromEnv(env) {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const projectUrl = env.SUPADB_PROJECT_URL;
  const publishableKey = env.SUPADB_PUBLISHABLE_KEY;
  const password =
    env.DATABSE_PASSWD_KEY ??
    env.DATABASE_PASSWD_KEY ??
    env.SUPADB_DB_PASSWORD ??
    env.DATABASE_PASSWORD;

  if (!projectUrl || !publishableKey || !password) {
    throw new Error(
      'DATABASE_URL or (SUPADB_PROJECT_URL, SUPADB_PUBLISHABLE_KEY, DATABSE_PASSWD_KEY) is required.'
    );
  }

  const projectRef = new URL(projectUrl).hostname.split('.')[0];
  if (!projectRef) {
    throw new Error('SUPADB_PROJECT_URL is invalid.');
  }

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

function toBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  return defaultValue;
}
