// Settings shared by the browser, server and edge parts of Sentry (error reports).
// Only errors are sent: no performance tracing, no session replay, no names, emails,
// IP addresses or cookies (sendDefaultPii: false, and beforeSend strips what is left).
// The DSN is not a secret: it only lets the site send error reports to our Sentry project (EU region).
import type { ErrorEvent } from '@sentry/nextjs'

export const SENTRY_DSN = 'https://037c6b7160aa5814ff95764b860cb6f7@o4512483835052032.ingest.de.sentry.io/4512483854778448'

export const sentryOptions = {
  dsn: SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || 'production',
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend(event: ErrorEvent) {
    delete event.user
    if (event.request) { delete event.request.cookies; delete event.request.headers; delete event.request.data }
    return event
  },
}
