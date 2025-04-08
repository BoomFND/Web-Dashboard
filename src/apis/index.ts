import { request } from './request'

interface Create {
  email: string
  confirmCode: number | string
  socialInviteCode?: string | null
}

interface AccountParams {
  name?: string
  pw?: string
  avatar?: string
}

/**
 * pc端注册
 * @param data {
 *  "email": "user@example.com",
 *  "confirmCode": "string"，
 *  "socialInviteCode": "string"
 * }
 * @returns
 */
export const register = (data: Create) =>
  request({
    url: '/account/web/register/',
    method: 'POST',
    data
  })

/**
 * 发送邮件
 * @param email 邮箱
 * @returns
 */
export const sendEmail = (email: string) =>
  request({
    url: '/mail/register_code/',
    method: 'POST',
    data: { email }
  })

/**
 * 登录
 * @param email 邮箱
 * @param pw 密码
 * @returns
 */
export const login = (email: string, pw: string) =>
  request({
    url: '/account/web/login/',
    method: 'POST',
    data: { email, pw }
  })

/**
 * 获取用户信息
 * @returns
 */
export const getAccount = () =>
  request({
    url: '/account/info/',
    method: 'GET'
  })

/**
 * 获取用户信息
 * @returns
 */
export const putAccount = (data: AccountParams) =>
  request({
    url: '/account/info/',
    method: 'PUT',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const putPw = (data: AccountParams, token: string) =>
  request({
    url: '/account/info/',
    method: 'PUT',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Token ' + token
    }
  })

/**
 * 发送邮件
 * @param email 邮箱
 * @returns
 */
export const sendResetEmail = (email: string) =>
  request({
    url: '/mail/reset_pw_code/',
    method: 'POST',
    data: { email }
  })

/**
 * 重置密码
 * {
 *  email: 邮箱
 *  confirmCode: 邀请码
 * }
 * @returns
 */
export const resetPw = (data: Create) =>
  request({
    url: '/account/web/reset_pw/',
    method: 'POST',
    data
  })

/** 获取selectKey */
export const getSelectKey = () =>
  request(
    {
      url: '/generic/info/',
      method: 'POST',
      data: {
        // random: `${new Date().valueOf()}${randomString()}`
      }
    },
    false,
    true,
    false
  )
