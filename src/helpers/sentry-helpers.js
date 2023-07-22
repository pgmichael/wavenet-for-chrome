import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'

export function initializeSentry() {
  console.log('Initializing Sentry...', ...arguments)

  // Nasty hack to make sentry work using Manifest V3
  // https://github.com/getsentry/sentry-javascript/issues/5289#issuecomment-1368705821
  // noinspection JSConstantReassignment
  Sentry.WINDOW.document = {
    visibilityState: 'hidden',
    addEventListener: () => {},
  }

  Sentry.init({
    dsn: 'https://1ff01a53014a4671ba548e9b431e2b15@o516851.ingest.sentry.io/5623837',
    release: process.env.npm_package_version,
    environment: process.env.ENVIROMENT || 'development',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    beforeSend: function (event) {
      if (event.user?.ip_address) delete event.user.ip_address
      if (event.request?.url) delete event.request.url
      return event
    },
  })
}
