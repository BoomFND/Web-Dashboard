import { defineStore } from 'pinia'
import { telegramBind, telegramRegister } from '@/apis/auth'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'

export const useTelegramStore = defineStore('telegram', () => {
  // 获取Telegram认证信息
  const fetchUrl = async () => {
    return new Promise((resolve, reject) => {
      try {
        window.Telegram.Login.auth(
          { bot_id: import.meta.env.VITE_APP_TG_ID, request_access: 'write', embed: 1 },
          async (data: any) => {
            if (!data) {
              // 失败时你需要做的逻辑
              console.error('Telegram login failed')
              message.error('Telegram login failed')
              return reject(data)
            }
            // 电报登录成功,返回tg数据
            const { id: userId, username, first_name, last_name } = data
            return resolve({ userId, username, first_name, last_name })
          },
        )
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }

  // 从discord网站回来后，拿到code，然后请求后台接口，完成认证
  const telegramAuthorization = async (
    userId: string,
    username: string,
    fullName: string,
    isBot: boolean,
  ) => {
    try {
      await telegramBind(userId, username, fullName, isBot)

      const { fetchAccountInfo } = useUserStore()

      // 更新account信息
      fetchAccountInfo()
    } catch (error) {
      console.error(error)
    }
  }

  // 从discord网站回来后，拿到code，然后请求后台接口，完成认证
  const telegramLoginOrRegister = async (
    userId: string,
    username: string,
    fullName: string,
    isBot: boolean,
  ) => {
    try {
      const { token }: any = await telegramRegister(userId, username, fullName, isBot)

      const { setAccessToken, fetchAccountInfo } = useUserStore()

      // 保存token
      setAccessToken(token)

      // 更新account信息
      fetchAccountInfo()
    } catch (error) {
      console.error(error)
    }
  }

  return { fetchUrl, telegramAuthorization, telegramLoginOrRegister }
})
