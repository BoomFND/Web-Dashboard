import { defineStore } from 'pinia'
import type { WalletInfo } from '@/stores/wallet'
import { getAccount } from '@/apis/index'

export interface Account {
  username: string
  name: string
  avatar: string
  wallet?: WalletInfo
  [key: string]: any
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户对象
    const account = ref<Account>({
      username: '',
      name: '',
      avatar: ''
    })

    const avatarColor = computed(() => localStorage.getItem('avatarColor') ?? undefined)

    // token
    const accessToken = ref('')

    // 设置用户信息
    const setAccount = (info: Partial<Account>) => {
      account.value = { ...account.value, ...info }
    }

    // 设置token
    function setAccessToken(v: string) {
      accessToken.value = v
    }

    // 设置头像颜色
    const setAvatarColor = () => {
      const colors = ['#00FFB4', '#F6255A', '#10E4F4', '#FFCA47', '#CA59FF', '#8DA8DA']
      const color = colors[Math.floor(Math.random() * colors.length)]

      localStorage.setItem('avatarColor', color)
    }

    function clearAll() {
      localStorage.removeItem('user')
      accessToken.value = ''
      account.value = {
        username: '',
        name: '',
        avatar: ''
      }

      // 清除discord认证
      localStorage.removeItem('discord')
    }

    // 调用接口，获取用户信息
    const fetchAccountInfo = async () => {
      try {
        if (!accessToken.value) return
        const res: any = await getAccount()
        setAccount(res)
      } catch (error) {
        console.error(error)
      }
    }

    return {
      account,
      avatarColor,
      accessToken,
      setAccessToken,
      setAccount,
      setAvatarColor,
      clearAll,
      fetchAccountInfo
    }
  },
  {
    // 持久化保存
    persist: true
  }
)
