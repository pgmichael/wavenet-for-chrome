import * as Sentry from "../node_modules/@sentry/browser"
import { Integrations } from "../node_modules/@sentry/tracing"
import { ExtensionInformation } from "./helpers"

export function initSentry(extensionInformation: ExtensionInformation) {
  Sentry.init({
    dsn: "https://1ff01a53014a4671ba548e9b431e2b15@o516851.ingest.sentry.io/5623837",
    release: extensionInformation.version,
    environment: extensionInformation.environment,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    beforeSend: event => {
      if (event.user?.ip_address) delete event.user.ip_address
      if (event.request?.url) delete event.request.url

      return event
    }
  })
}