import { AxiosError, type AxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { encrypt, decrypt, randomString } from '@/utils'
import { useGlobalStore } from '@/stores/global'
import { message } from 'ant-design-vue'

// baseURL
const apiOrigin = import.meta.env.VITE_APP_API_PREFIX as string

/**
 *
 * @param options 请求配置
 * @param cancelToast 是否toast显示错误
 * @param needEncrypt 是否需要加密
 * @param combination 组合加密还是固定加密
 * @returns
 */
export function request(
  options: AxiosRequestConfig,
  cancelToast: boolean = false,
  needEncrypt = false,
  combination = true
) {
  return new Promise((resolve, reject) => {
    const global = useUserStore()
    const globalStore = useGlobalStore()

    // create an axios instance
    const request = axios.create({
      baseURL: apiOrigin,
      withCredentials: false,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'accept-language': 'en-US'
      }
    })

    // 请求拦截
    request.interceptors.request.use(async (config) => {
      if (config.headers) {
        // token
        if (global.accessToken) {
          // 仅在请求本站接口时添加 token
          if (config.baseURL?.startsWith(apiOrigin) || config.url?.startsWith(apiOrigin)) {
            config.headers.Authorization = `Token ${global.accessToken}`
          }
        }
      }

      return config
    })

    // 响应拦截
    request.interceptors.response.use(
      (res: any) => {
        // 如果需要加密，则需要对结果进行解密
        if (needEncrypt) {
          const { data: data } = res

          const decryptData = (select: string) => {
            return decrypt(select, data.data)
          }
          if (combination) {
            // 组合秘钥
            const selectKey = globalStore.selectKey
            return decryptData(selectKey)
          } else {
            // 固定秘钥
            return decryptData(import.meta.env.VITE_APP_SECRET_KEY)
          }
        }
        return res.data
      },
      async (err: AxiosError) => {
        const modalStore = useModalStore()

        console.log(err, 'err')

        // 未登录或者登录过期
        if (err.response?.status === 401) {
          // 清除登录信息
          // global.clearAll()
          // 弹窗
          return modalStore.toggleSignInModal()
        }

        let errMsg

        const { ERR_NETWORK, ERR_CANCELED, ECONNABORTED } = AxiosError
        if ([ERR_NETWORK, ERR_CANCELED, ECONNABORTED].includes(err.code as string)) {
          errMsg = err.message
        } else {
          errMsg = (err.response?.data as any)?.detail
        }

        // toast错误
        if (!cancelToast) message.error(errMsg, 5)

        return Promise.reject(err)
      }
    )

    // 是否需要加密
    if (needEncrypt) {
      /**
       * 加密请求参数
       * @param select 秘钥不同
       */
      const encryptParmas = (select: string) => {
        const { method } = options
        const paramsName = method?.toUpperCase() === 'POST' ? 'data' : 'params'
        if (options[paramsName]) {
          // random动态生成，防止random过期
          options[paramsName].random = `${new Date().valueOf()}${randomString()}`
          // console.log(options[paramsName])
          options[paramsName] = {
            [paramsName]: encrypt(select, JSON.stringify(options[paramsName]))
          }
        }
      }

      if (combination) {
        // console.log(JSON.stringify(options))

        // 组合秘钥
        const selectKey = globalStore.selectKey
        encryptParmas(selectKey)
      } else {
        // 固定秘钥
        encryptParmas(import.meta.env.VITE_APP_SECRET_KEY)
      }
    }

    return request(options).then(
      (res) => {
        resolve(res)
      },
      (error) => {
        if (error.response) {
          reject(error.response.data)
        } else {
          reject(error)
        }
      }
    )
  })
}
