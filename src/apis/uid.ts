import { request } from './request'

/**
 * 发送绑定邮箱验证码
 * @param data
 * {
 *    email: 邮箱
 * }
 * @returns
 */
export const sendBindEmailCode = (email: String) =>
  request({
    url: '/mail/bind_email_code/',
    method: 'POST',
    data: { email }
  })

/**
 * 绑定邮箱
 * @param data
 * {
 *    email: 邮箱
 *    confirmCode: 验证码
 *    socialInviteCode: 邀请码
 * }
 * @returns
 */
export const bindEmail = (data: Object) =>
  request({
    url: '/account/web/bind_email/',
    method: 'POST',
    data
  })

/**
 * 绑定邮箱
 * @param data
 * {
 *    address: 钱包地址
 *    chainId: web3钱包链
 * }
 * @returns
 */
export const walletLogin = (data: Object) =>
  request({
    url: '/assets/wallet/login_or_register/',
    method: 'POST',
    data
  })
