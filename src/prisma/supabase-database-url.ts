import type { ConfigService } from '@nestjs/config';

interface SupabaseDbConfig {
  databaseUrl: string;
}

export function resolveSupabaseDatabaseConfig(
  configService: ConfigService
): SupabaseDbConfig {
  const explicitDatabaseUrl = configService.get<string>('DATABASE_URL');
  if (explicitDatabaseUrl) {
    return {
      databaseUrl: explicitDatabaseUrl
    };
  }

  const projectUrl =
    configService.get<string>('PROJECT_URL') ??
    configService.get<string>('SUPABASE_URL') ??
    configService.get<string>('SUPABASE_PROJECT_URL') ??
    configService.get<string>('SUPADB_PROJECT_URL');
  const publishableKey =
    configService.get<string>('DATABASE_PUBLISHABLE_KEY') ??
    configService.get<string>('DATABASE_PUBLISHABLE KEY') ??
    configService.get<string>('SUPABASE_KEY') ??
    configService.get<string>('SUPABASE_PUBLISHABLE_KEY') ??
    configService.get<string>('SUPADB_PUBLISHABLE_KEY') ??
    configService.get<string>('ANON_KEY');
  const dbPassword =
    configService.get<string>('DATABSE_PASSWD_KEY') ??
    configService.get<string>('DATABASE_PASSWD_KEY') ??
    configService.get<string>('SUPADB_DB_PASSWORD') ??
    configService.get<string>('DATABASE_PASSWORD');

  if (!projectUrl || !publishableKey || !dbPassword) {
    throw new Error(
      'DATABASE_URL or (PROJECT_URL, DATABASE_PUBLISHABLE_KEY, DATABSE_PASSWD_KEY) must be configured.'
    );
  }

  const projectRef = extractProjectRef(projectUrl);
  const connectionMode = (
    configService.get<string>('SUPADB_CONNECTION_MODE') ?? 'pooler'
  ).toLowerCase();
  const defaultDbUser =
    connectionMode === 'pooler' ? `postgres.${projectRef}` : 'postgres';
  const dbUser = configService.get<string>('SUPADB_DB_USER') ?? defaultDbUser;
  const dbName = configService.get<string>('SUPADB_DB_NAME') ?? 'postgres';
  const dbSchema = configService.get<string>('SUPADB_DB_SCHEMA') ?? 'public';
  const sslMode = (configService.get<string>('SUPADB_SSL_MODE') ?? 'require').toLowerCase();
  const useLibpqCompat = toBoolean(
    configService.get<string>('SUPADB_USE_LIBPQ_COMPAT'),
    true
  );
  const dbHost = resolveDbHost(configService, projectRef, connectionMode);
  const dbPort =
    configService.get<string>('SUPADB_DB_PORT') ??
    (connectionMode === 'pooler' ? '6543' : '5432');
  const encodedDbUser = encodeURIComponent(dbUser);
  const encodedDbPassword = encodeURIComponent(dbPassword);
  const query = new URLSearchParams();
  query.set('schema', dbSchema);
  query.set('sslmode', sslMode);
  if (useLibpqCompat) {
    query.set('uselibpqcompat', 'true');
  }
  const databaseUrl =
    `postgresql://${encodedDbUser}:${encodedDbPassword}` +
    `@${dbHost}:${dbPort}/${dbName}` +
    `?${query.toString()}`;

  return {
    databaseUrl
  };
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

function resolveDbHost(
  configService: ConfigService,
  projectRef: string,
  connectionMode: string
): string {
  const explicitDbHost = configService.get<string>('SUPADB_DB_HOST');
  if (explicitDbHost) {
    return explicitDbHost;
  }

  if (connectionMode === 'direct') {
    return `db.${projectRef}.supabase.co`;
  }

  const region =
    configService.get<string>('SUPADB_REGION') ??
    configService.get<string>('SUPADB_POOLER_REGION') ??
    'ap-northeast-2';

  return `aws-0-${region}.pooler.supabase.com`;
}

function extractProjectRef(projectUrl: string): string {
  const parsedProjectUrl = new URL(projectUrl);
  const hostnameParts = parsedProjectUrl.hostname.split('.');
  const projectRef = hostnameParts[0];

  if (!projectRef) {
    throw new Error('PROJECT_URL is invalid.');
  }

  return projectRef;
}
