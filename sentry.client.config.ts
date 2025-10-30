import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% when errors occur
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Integrations
    integrations: [
      // BrowserTracing and Replay configured automatically in @sentry/nextjs
    ],
    
    // Error Filtering
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors
      'NetworkError',
      'Non-Error promise rejection captured',
    ],
    
    // User Context
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry (dev):', hint.originalException || hint.syntheticException)
        return null
      }
      return event
    },
  })
}

