import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as Sentry from '@sentry/vue'

import 'virtual:svg-icons-register'
import App from './App.vue'
import router from './router'
import {getSelectKey} from './apis'
import { useGlobalStore } from './stores/global'


const app = createApp(App)

Sentry.init({
  app,
  dsn: 'https://9cf31b435ffd6277547bf8ad3fd95747@o4506036045742080.ingest.sentry.io/4506725554913280',
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'https://staging.rinku.link/']
    }),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  maxBreadcrumbs: 50
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)


const handleSelectKey = async () => {
  try {
    const selectKey = await getSelectKey()
    //保存selectKey型global中
    const global = useGlobalStore()
    global.setSelectKey( import.meta.env.VITE_APP_SECRET_KEY + selectKey)
  }
  catch (error){
    console.error(error)
  }
}

handleSelectKey()
app.mount('#app')
