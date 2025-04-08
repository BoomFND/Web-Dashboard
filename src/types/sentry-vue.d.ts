declare module '@sentry/vue' {
  import { App } from 'vue'
  import { Integration } from '@sentry/types'

  interface InitOptions {
    app: App
    dsn: string
    integrations?: Integration[]
    tracesSampleRate?: number
    replaysSessionSampleRate?: number
    replaysOnErrorSampleRate?: number
    maxBreadcrumbs?: number
  }

  export function init(options: InitOptions): void
  export class BrowserTracing {
    constructor(options: { tracePropagationTargets: string[] })
  }
  export class Replay {}
}
