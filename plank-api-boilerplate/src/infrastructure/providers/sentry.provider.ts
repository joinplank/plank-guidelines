import * as Sentry from '@sentry/node';

export interface ISentryProvider {
  init(): void;
  captureException(error: unknown): void;
  captureMessage(message: string): void;
}

export class SentryProvider implements ISentryProvider {
  init(): void {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) return;

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: 1.0,
    });
  }

  captureException(error: unknown): void {
    Sentry.captureException(error);
  }

  captureMessage(message: string): void {
    Sentry.captureMessage(message);
  }
}
