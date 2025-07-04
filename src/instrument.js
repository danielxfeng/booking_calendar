import * as Sentry from "@sentry/react";

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
      dsn: "https://0eb2022ec9ba425594bf8d0fd3147e0f@sentry.hive.fi/28",
      sendDefaultPii: true,
      integrations: [],
    });
}