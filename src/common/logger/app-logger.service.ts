import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';

const LOG_LEVELS: Record<string, LogLevel[]> = {
  error: ['error'],
  warn: ['error', 'warn'],
  info: ['error', 'warn', 'log'],
  debug: ['error', 'warn', 'log', 'debug'],
  verbose: ['error', 'warn', 'log', 'debug', 'verbose']
};

@Injectable()
export class AppLoggerService extends ConsoleLogger {
  constructor() {
    super('CAP3', {
      timestamp: true,
      logLevels: resolveLogLevels(process.env.LOG_LEVEL)
    });
  }

  info(message: string, context = 'App'): void {
    super.log(message, context);
  }

  debug(message: string, context = 'App'): void {
    super.debug(message, context);
  }

  error(message: string, trace?: string, context = 'App'): void {
    super.error(message, trace, context);
  }
}

function resolveLogLevels(logLevel: string | undefined): LogLevel[] {
  const normalizedLogLevel = (logLevel ?? 'debug').toLowerCase();
  return LOG_LEVELS[normalizedLogLevel] ?? LOG_LEVELS['debug'];
}
