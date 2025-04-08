import { encrypt, decrypt } from './aes'
import { request } from '@/apis/request'

/** 生成随机字符串 */
const randomString = (len: number = 6): string => {
  let t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
    a = t.length,
    n = ''
  for (let i = 0; i < len; i++) n += t.charAt(Math.floor(Math.random() * a))
  return n
}

export { encrypt, decrypt, randomString, request }
