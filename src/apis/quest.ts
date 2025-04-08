import { request } from './request'

export const getSocialRewardTasks = () =>
  request({
    url: '/social/social-reward-rules/',
    method: 'GET',
    params: {
      size: 15
    }
  })

/**
 * 获取邀请人数量
 * @returns
 */
export const getReferralsCount = () =>
  request({
    url: '/social/profile/',
    method: 'GET'
  })

/**
 * 给twitter添加关注
 * @returns
 */
export const followTwitterReward = () =>
  request({
    url: '/social/twitter-reward-follow/',
    method: 'POST'
  })

/**
 * 给twitter添加关注
 * @returns
 */
export const shareTwitterVideo = () =>
  request({
    url: '/social/twitter-reward-share-video/',
    method: 'POST'
  })

/**
 * 给telegram添加关注
 * @returns
 */
export const followTelegramReward = () =>
  request({
    url: '/social/reward-join-telegram/',
    method: 'POST'
  })

/**
 * 获取boom moments 视频
 * @returns
 */
export const getQuestVideos = () =>
  request({
    url: '/replay/manual_replays/',
    method: 'GET'
  })

/**
 * 获取邀请排名列表
 * @returns
 */
export const getReferralsList = (page = 1, size = 10) =>
  request({
    url: '/social/ranking/',
    method: 'GET',
    params: { page, size }
  })
