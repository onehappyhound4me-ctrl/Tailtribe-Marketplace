import * as Sentry from '@sentry/nextjs'

// Check both SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN for compatibility
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: 0.1,
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Server-specific settings
    integrations: [
      // Integrations configured automatically in @sentry/nextjs
    ],
    
    // Error Context
    beforeSend(event, hint) {
      // Don't send in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Server (dev):', hint.originalException || hint.syntheticException)
        return null
      }
      
      // Add extra context
      if (event.request) {
        event.tags = {
          ...event.tags,
          route: event.request.url,
        }
      }
      
      return event
    },
  })
}

