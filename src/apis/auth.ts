import { request } from './request'

/**
 * 获取discord链接地址
 * @returns
 */
export const getDiscordUrl = () =>
  request({
    url: '/discord/login_url/',
    method: 'GET'
  })

/**
 * 获取twitter链接地址
 * @returns
 */
export const getTwitterUrl = () =>
  request({
    url: '/social/twitter-auth-redirect/',
    method: 'GET'
  })

/**
 * discord验证
 * @returns
 */
export const discordLogin = (code: string) =>
  request({
    url: '/discord/login/',
    method: 'POST',
    data: { code }
  })

/**
 * discord登录获取Token
 * @returns
 */
export const discordRegister = (code: string) =>
  request({
    url: '/discord/login_or_register/',
    method: 'POST',
    data: { code }
  })

/**
 * twitter验证
 * @returns
 */
export const twitterLogin = (oauthToken: string, oauthVerifier: string) =>
  request({
    url: '/social/twitter-auth-callback/',
    method: 'POST',
    data: { oauthToken, oauthVerifier }
  })

/**
 * twitter登录获取Token
 * @returns
 */
export const twitterRegister = (oauthToken: string, oauthVerifier: string) =>
  request({
    url: '/social/twitter_login_or_register/',
    method: 'POST',
    data: { oauthToken, oauthVerifier }
  })

/**
 * twitter video验证
 * @returns
 */
export const twitterVideoLogin = (oauthToken: string, oauthVerifier: string) =>
  request({
    url: '/social/twitter-video-callback/',
    method: 'POST',
    data: { oauthToken, oauthVerifier }
  })

/**
 * telegram登录获取Token
 * @returns
 */
export const telegramRegister = (
  userId: string,
  username: string,
  fullName: string,
  isBot: boolean
) =>
  request({
    url: '/tg_bot/login_or_register/',
    method: 'POST',
    data: { userId, username, fullName, isBot }
  })

/**
 * telegram绑定
 * @returns
 */
export const telegramBind = (userId: string, username: string, fullName: string, isBot: boolean) =>
  request({
    url: '/tg_bot/bind/',
    method: 'POST',
    data: { userId, username, fullName, isBot }
  })
