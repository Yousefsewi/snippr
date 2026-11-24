// Sentry on the server: reports errors in pages and API routes (Node.js and Edge).
import * as Sentry from '@sentry/nextjs'
import { sentryOptions } from './lib/sentry-options'

export function register() {
  Sentry.init(sentryOptions)
}

export const onRequestError = Sentry.captureRequestError
