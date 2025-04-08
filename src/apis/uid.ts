import { request } from './request'

/**
 * 发送绑定邮箱验证码
 * @param data
 * {
 *    email: 邮箱
 * }
 * @returns
 */
export const sendBindEmailCode = (email: string) =>
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
export const bindEmail = (data: object) =>
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
export const walletLogin = (data: object) =>
  request(
    {
      url: '/assets/wallet/login_or_register/',
      method: 'POST',
      data
    },
    false,
    true
  ).then(
    (result) => {
      return Promise.resolve(JSON.parse(<string>result))
    },
    (error) => {
      return Promise.reject(error)
    }
  )

export const confirmAddress = () =>
  request({
    url: '/account/web/confirm_address/',
    method: 'POST'
  })

/**
 * 钱包登录
 * @param data
 * {
 *    address: 钱包地址
 * }
 * @returns
 */
export const solanaWalletLogin = (data: object) =>
  request(
    {
      url: '/assets/solana/login_or_register/',
      method: 'POST',
      data
    },
    false,
    true
  ).then(
    (result) => {
      return Promise.resolve(JSON.parse(<string>result))
    },
    (error) => {
      return Promise.reject(error)
    }
  )

/**
 * 绑定钱包
 * @param data
 * {
 *    address: 钱包地址
 * }
 * @returns
 */
export const solanaWalletConnect = (data: object) =>
  request(
    {
      url: '/assets/solana/connect/',
      method: 'POST',
      data
    },
    true
  )

/**
 * 确认邀请码
 * @param data
 * {
 *    inviteCode: 邀请码
 * }
 * @returns
 */
export const inviteCodeConfirm = (data: object) =>
  request({
    url: '/account/web/invite_code_confirm/',
    method: 'POST',
    data
  })
