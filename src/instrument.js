import * as Sentry from "@sentry/react";

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('SENTRY_DSN is not set, skipping Sentry initialization');
  } else {
  Sentry.init({
      dsn,
        sendDefaultPii: true,
        integrations: [],
      });
  }
}