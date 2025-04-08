import 'unfonts.css'
import './assets/css/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { Buffer } from 'buffer'
import { config } from './utils/wagmi'
import { walletSolanaOptions, SolanaWallets } from './utils/solana'
// import * as Sentry from '@sentry/vue'

import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import { getSelectKey } from './apis'
import { useGlobalStore } from './stores/global'

const app = createApp(App)

window.Buffer = Buffer

// Sentry.init({
//   app,
//   dsn: 'https://9cf31b435ffd6277547bf8ad3fd95747@o4506036045742080.ingest.sentry.io/4506725554913280',
//   integrations: [
//     new Sentry.BrowserTracing({
//       tracePropagationTargets: ['localhost', 'https://staging.rinku.link/'],
//     }),
//     new Sentry.Replay(),
//   ],
//   tracesSampleRate: 1.0,
//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1.0,
//   maxBreadcrumbs: 50,
// })

const queryClient = new QueryClient()

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

app.use(router)

app.use(SolanaWallets, walletSolanaOptions)

app.use(WagmiPlugin, { config })

app.use(VueQueryPlugin, { queryClient })

app.mount('#app')

const handleSelectKey = async () => {
  try {
    const selectKey = await getSelectKey()
    //保存selectKey型global中
    const global = useGlobalStore()
    global.setSelectKey(import.meta.env.VITE_APP_SECRET_KEY + selectKey)
  } catch (error) {
    console.error(error)
  }
}

handleSelectKey()
