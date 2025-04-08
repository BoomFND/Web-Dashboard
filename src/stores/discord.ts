import { defineStore } from 'pinia'
import { getDiscordUrl, discordLogin, discordRegister } from '@/apis/auth'
import { useUserStore } from '@/stores/user'

export const useDiscordStore = defineStore('discord', () => {
  // 获取discord认证链接
  const fetchUrl = async () => {
    try {
      const res: any = await getDiscordUrl()

      const url = res.url

      window.location.href = url
      // window.open(url, '_blank')
    } catch (error) {
      console.error(error)
    }
  }

  // 从discord网站回来后，拿到code，然后请求后台接口，完成认证
  const discordAuthorization = async (code: string) => {
    try {
      await discordLogin(code)

      const { fetchAccountInfo } = useUserStore()

      // 更新account信息
      fetchAccountInfo()
    } catch (error) {
      console.error(error)
    }
  }

  // 从discord网站回来后，拿到code，然后请求后台接口，完成认证
  const discordLoginOrRegister = async (code: string) => {
    const { setAccessToken, fetchAccountInfo } = useUserStore()
    try {
      const { token }: any = await discordRegister(code)
      setAccessToken(token)

      // 更新account信息
      fetchAccountInfo()
    } catch (error) {
      console.error(error)
    }
  }

  return { fetchUrl, discordAuthorization, discordLoginOrRegister }
})
