// wallet.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { connectWallet, confirmAccount } from '@/apis/assets' // Make sure this path matches your project structure
import { walletLogin, solanaWalletLogin, solanaWalletConnect } from '@/apis/uid'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'

export interface WalletInfo {
  chainId: number | string
  address: string | undefined
  [key: string]: any
  signedGenesisProof?: boolean
}

export interface NeedCombineAccount {
  id: number
  points: number
  email: string
  twitter: string
  telegram: string
  discord: string
}

export const useWalletStore = defineStore(
  'wallet',
  () => {
    const userStore = useUserStore()

    const walletConnectType = ref<'sol' | 'evm' | ''>('')

    const wallet = ref<WalletInfo>({
      network: '',
      chainId: '',
      address: '',
      signedGenesisProof: false
    })

    const solanaWallet = ref<WalletInfo>({
      chainId: '',
      address: ''
    })

    const needCombineAccounts = ref<Array<NeedCombineAccount>>([])

    const loginWallet = async (info: WalletInfo) => {
      const data = {
        chainId: info.chainId, // Include chainId in the API call
        address: info.address,
        gbInviteCode: sessionStorage.getItem('invite')
      }
      try {
        const res = await walletLogin(data)
        return Promise.resolve(res)
      } catch (error) {
        console.error('Failed to login wallet:', error)
        return Promise.reject(false)
      }
    }

    // A method to update the wallet info and send the new info to the backend
    const setWallet = async (info: WalletInfo) => {
      const modalStore = useModalStore()
      try {
        // Only call the backend if both network and address are provided
        if (info.chainId && info.address) {
          const userStore = useUserStore()
          if (!userStore.accessToken) {
            const { token, accounts }: any = await loginWallet(info)
            walletConnectType.value = 'evm'
            userStore.setAccessToken(token)
            needCombineAccounts.value = accounts
          } else {
            await connectWallet({
              chainId: info.chainId, // Include chainId in the API call
              address: info.address
            })
          }
          wallet.value = info
          return Promise.resolve(true)
        }
        return Promise.resolve(true)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        // Here, you might want to handle errors, such as by notifying the user
        if ((error as { code: string; detail: string }).code === '30000002') {
          modalStore.toggleBindNewWalletModal(true)
        }
        return Promise.reject(false)
      }
    }

    const emptyWallet = () => {
      wallet.value = {
        network: '',
        chainId: '',
        address: ''
      }
      solanaWallet.value = {
        chainId: '',
        address: ''
      }
      needCombineAccounts.value = []
    }

    const updateSignedGenesisProof = (signed: boolean) => {
      wallet.value.signedGenesisProof = signed
    }

    const confirmWalletAccount = async (accountId: number) => {
      try {
        const { token }: any = await confirmAccount(accountId)
        userStore.setAccessToken(token)
      } catch (error) {
        console.error('Failed to confirm account:', error)
      }
    }

    const loginSolanaWallet = async (publicKey: string) => {
      const data = {
        address: publicKey,
        gbInviteCode: sessionStorage.getItem('invite')
      }
      try {
        const { token }: any = await solanaWalletLogin(data)
        userStore.setAccessToken(token)
        walletConnectType.value = 'sol'
        solanaWallet.value.address = publicKey
        return Promise.resolve(token)
      } catch (error) {
        console.error('Failed to login solana wallet:', error)
        return Promise.reject(false)
      }
    }

    const bindSolanaWallet = async (publicKey: string) => {
      const data = {
        address: publicKey
      }
      try {
        const res = await solanaWalletConnect(data)
        solanaWallet.value.address = publicKey
        return Promise.resolve(res)
      } catch (error: any) {
        console.error('Failed to bind solana wallet:', error)
        return Promise.reject({ ...error, code: 'bindError' })
      }
    }

    return {
      walletConnectType,
      wallet,
      solanaWallet,
      needCombineAccounts,
      setWallet,
      emptyWallet,
      updateSignedGenesisProof,
      confirmWalletAccount,
      loginSolanaWallet,
      bindSolanaWallet
    }
  },
  {
    persist: true
  }
)
