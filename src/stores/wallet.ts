// wallet.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { connectWallet } from '@/apis/assets' // Make sure this path matches your project structure
import { walletLogin } from '@/apis/uid'
import { useUserStore } from '@/stores/user'

export interface WalletInfo {
  chainId: string
  address: string
  [key: string]: any
  signedGenesisProof?: boolean
}

export const useWalletStore = defineStore(
  'wallet',
  () => {
    const wallet = ref<WalletInfo>({
      network: '',
      chainId: '',
      address: '',
      signedGenesisProof: false
    })

    const loginWallet = async (info: WalletInfo) => {
      const data = {
        chainId: info.chainId, // Include chainId in the API call
        address: info.address
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
      try {
        // Only call the backend if both network and address are provided
        if (info.chainId && info.address) {
          const userStore = useUserStore()
          if (!userStore.accessToken) {
            const { token }: any = await loginWallet(info)

            userStore.setAccessToken(token)
          }
          await connectWallet({
            chainId: info.chainId, // Include chainId in the API call
            address: info.address
          })
          wallet.value = info
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        // Here, you might want to handle errors, such as by notifying the user
      }
    }

    const emptyWallet = () => {
      wallet.value = {
        network: '',
        chainId: '',
        address: ''
      }
      // connectWallet({
      //   chainId: '', // Include chainId in the API call
      //   address: ''
      // })
    }

    const updateSignedGenesisProof = (signed: boolean) => {
      wallet.value.signedGenesisProof = signed
    }

    return {
      wallet,
      setWallet,
      emptyWallet,
      updateSignedGenesisProof
    }
  },
  {
    persist: true
  }
)
