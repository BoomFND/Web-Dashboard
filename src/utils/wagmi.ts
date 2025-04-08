import { http, createConfig, type Config } from '@wagmi/vue'
import { mainnet, opBNB, opBNBTestnet } from '@wagmi/vue/chains'
import { injected, metaMask, walletConnect } from '@wagmi/vue/connectors'

export const config: Config = createConfig({
  chains: [mainnet, opBNB, opBNBTestnet],
  connectors: [
    walletConnect({
      projectId: import.meta.env.VITE_APP_WC_PROJECT_ID
    }),
    metaMask(),
    // OKX钱包
    injected({
      target: () => ({
        id: 'okxWallet',
        name: 'OKX Wallet',
        provider: () => window.okxwallet
      })
    }),
    // Binance钱包
    injected({
      target: () => ({
        id: 'binanceWallet',
        name: 'Binance Wallet',
        provider: () => window.BinanceChain
      })
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [opBNB.id]: http(),
    [opBNBTestnet.id]: http()
  },
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}

declare global {
  interface Window {
    okxwallet?: any
    phantom?: { solana?: any }
    BinanceChain?: any
    ton?: any
  }
}
