/**
 * Optional error monitoring via Sentry.
 * Set SENTRY_DSN (and optionally SENTRY_ENVIRONMENT) to enable.
 */

type ErrorContext = Record<string, unknown>;

let sentryInitialized = false;

async function initSentry(): Promise<boolean> {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || sentryInitialized) return sentryInitialized;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      environment:
        process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
    sentryInitialized = true;
    return true;
  } catch {
    return false;
  }
}

export function captureException(
  error: unknown,
  context?: ErrorContext
): void {
  void (async () => {
    const ready = await initSentry();
    if (ready) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(error, { extra: context });
      return;
    }
    console.error("[monitoring]", error, context);
  })();
}
