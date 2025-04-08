import { defineStore } from 'pinia'
import { getTwitterUrl, twitterLogin, twitterRegister, twitterVideoLogin } from '@/apis/auth'
import { useUserStore } from '@/stores/user'

export const useTwitterStore = defineStore('Twitter', () => {
  // 获取Twitter认证链接
  const fetchUrl = async () => {
    try {
      const res: any = await getTwitterUrl()

      const url = res.redirectUrl

      window.location.href = url
      // window.open(url, '_blank')
    } catch (error) {
      console.error(error)
    }
  }

  // 从Twitter网站回来后，拿到code，然后请求后台接口，完成认证
  const twitterAuthorization = async (oauth_token: string, oauth_verifier: string) => {
    try {
      await twitterLogin(oauth_token, oauth_verifier)

      const { fetchAccountInfo } = useUserStore()

      // 更新account信息
      fetchAccountInfo()
    } catch (error) {
      console.error(error)
    }
  }

  // 从discord网站回来后，拿到code，然后请求后台接口，完成认证
  const twitterLoginOrRegister = async (oauth_token: string, oauth_verifier: string) => {
    const { setAccessToken, fetchAccountInfo } = useUserStore()

    try {
      const { token }: any = await twitterRegister(oauth_token, oauth_verifier)

      // 保存token
      setAccessToken(token)

      // 更新account信息
      fetchAccountInfo()
    } catch (error) {
      console.error(error)
    }
  }

  // 从Twitter网站回来后，拿到code，然后请求后台接口，完成认证
  const twitterVideoAuthorization = async (oauth_token: string, oauth_verifier: string) => {
    try {
      await twitterVideoLogin(oauth_token, oauth_verifier)

      const { fetchAccountInfo } = useUserStore()

      // 更新account信息
      fetchAccountInfo()
    } catch (error) {
      console.error(error)
    }
  }

  return { fetchUrl, twitterAuthorization, twitterVideoAuthorization, twitterLoginOrRegister }
})
