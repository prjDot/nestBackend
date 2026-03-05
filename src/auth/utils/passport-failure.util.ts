interface PassportFailureDetail {
  reason: string;
  providerErrorCode?: string;
  providerStatus?: number;
}

const GENERIC_OAUTH_REASON = 'OAuth authentication failed';

export function resolvePassportFailureDetail(
  err: unknown,
  info: unknown
): PassportFailureDetail {
  const candidates = collectCandidates(err, info);

  let reason: string | undefined;
  let providerErrorCode: string | undefined;
  let providerStatus: number | undefined;

  for (const candidate of candidates) {
    const message = extractMessage(candidate);
    if (!reason && message && message !== GENERIC_OAUTH_REASON) {
      reason = message;
    }

    const code = extractCode(candidate);
    if (!providerErrorCode && code) {
      providerErrorCode = code;
    }

    const status = extractStatus(candidate);
    if (!providerStatus && status) {
      providerStatus = status;
    }
  }

  if (!reason) {
    reason = extractMessage(info) ?? extractMessage(err) ?? GENERIC_OAUTH_REASON;
  }

  return {
    reason,
    providerErrorCode,
    providerStatus
  };
}

function collectCandidates(err: unknown, info: unknown): unknown[] {
  const candidates: unknown[] = [err, info];
  const nestedKeys = ['oauthError', 'cause', 'inner'];

  for (const source of [err, info]) {
    if (!isRecord(source)) {
      continue;
    }

    for (const key of nestedKeys) {
      const nestedValue = source[key];
      if (nestedValue !== undefined) {
        candidates.push(nestedValue);
      }
    }

    const data = source['data'];
    if (data !== undefined) {
      candidates.push(data);
      const parsedData = tryParseJson(data);
      if (parsedData !== undefined) {
        candidates.push(parsedData);
      }
    }
  }

  return candidates;
}

function extractMessage(input: unknown): string | undefined {
  if (input instanceof Error) {
    return normalizeString(input.message);
  }

  if (typeof input === 'string') {
    const parsed = tryParseJson(input);
    if (parsed !== undefined) {
      return extractMessage(parsed) ?? normalizeString(input);
    }
    return normalizeString(input);
  }

  if (!isRecord(input)) {
    return undefined;
  }

  const errorDescription = normalizeString(input['error_description']);
  if (errorDescription) {
    return errorDescription;
  }

  const message = normalizeString(input['message']);
  if (message) {
    return message;
  }

  const error = normalizeString(input['error']);
  if (error) {
    return error;
  }

  return undefined;
}

function extractCode(input: unknown): string | undefined {
  if (!isRecord(input)) {
    return undefined;
  }

  const code = input['code'];
  if (typeof code === 'string' && code.trim().length > 0) {
    return code;
  }

  const error = input['error'];
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return undefined;
}

function extractStatus(input: unknown): number | undefined {
  if (!isRecord(input)) {
    return undefined;
  }

  const statusCandidates = [input['status'], input['statusCode']];
  for (const statusCandidate of statusCandidates) {
    if (
      typeof statusCandidate === 'number' &&
      Number.isInteger(statusCandidate) &&
      statusCandidate > 0
    ) {
      return statusCandidate;
    }
  }

  return undefined;
}

function tryParseJson(input: unknown): unknown {
  if (typeof input !== 'string') {
    return undefined;
  }

  const trimmed = input.trim();
  if (
    (!trimmed.startsWith('{') || !trimmed.endsWith('}')) &&
    (!trimmed.startsWith('[') || !trimmed.endsWith(']'))
  ) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

function normalizeString(input: unknown): string | undefined {
  if (typeof input !== 'string') {
    return undefined;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
