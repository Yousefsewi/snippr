// Sentry in the browser: reports errors that happen on visitors' and barbers' screens.
import * as Sentry from '@sentry/nextjs'
import { sentryOptions } from './lib/sentry-options'

Sentry.init(sentryOptions)
