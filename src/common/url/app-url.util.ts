type ReadConfigValue = (key: string) => string | undefined;

const DEFAULT_PORT = '8080';
const DEFAULT_LOCAL_CORS_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

export function resolveAppBaseUrl(readValue: ReadConfigValue): string {
  const explicitBaseUrl = readValue('APP_BASE_URL');
  if (explicitBaseUrl) {
    return normalizeUrlPath(explicitBaseUrl);
  }

  const railwayPublicDomain = readValue('RAILWAY_PUBLIC_DOMAIN');
  if (railwayPublicDomain) {
    const domainWithoutProtocol = railwayPublicDomain.replace(/^https?:\/\//, '');
    return normalizeUrlPath(`https://${domainWithoutProtocol}`);
  }

  const port = readValue('PORT') ?? DEFAULT_PORT;
  return normalizeUrlPath(`http://localhost:${port}`);
}

export function resolveCallbackUrl(
  readValue: ReadConfigValue,
  explicitCallbackKey: string,
  callbackPath: string
): string {
  const explicitCallbackUrl = readValue(explicitCallbackKey);
  if (explicitCallbackUrl) {
    return normalizeUrlPath(explicitCallbackUrl);
  }

  return normalizeUrlPath(
    `${trimTrailingSlash(resolveAppBaseUrl(readValue))}${callbackPath}`
  );
}

export function resolveCorsOrigins(readValue: ReadConfigValue): string[] {
  const configuredOrigins = readValue('CORS_ALLOWED_ORIGINS');
  if (!configuredOrigins) {
    return DEFAULT_LOCAL_CORS_ALLOWED_ORIGINS;
  }

  const parsedOrigins = configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map(normalizeOrigin);

  return parsedOrigins.length > 0
    ? Array.from(new Set(parsedOrigins))
    : DEFAULT_LOCAL_CORS_ALLOWED_ORIGINS;
}

export function trimTrailingSlash(input: string): string {
  if (input.endsWith('/')) {
    return input.slice(0, -1);
  }
  return input;
}

export function normalizeUrlPath(input: string): string {
  try {
    const url = new URL(input);
    url.pathname = url.pathname.replace(/\/{2,}/g, '/');
    return trimTrailingSlash(url.toString());
  } catch {
    return trimTrailingSlash(input.replace(/([^:]\/)\/+/g, '$1'));
  }
}

function normalizeOrigin(input: string): string {
  try {
    return new URL(input).origin;
  } catch {
    return trimTrailingSlash(input);
  }
}
