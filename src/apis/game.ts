import { request } from './request'

/**
 * 获取我的游戏积分
 * @param type: 'GLOBAL' | 'DOTA2' | 'VALORANT' | 'LOL'
 * @returns
 */
export const getMyPoints = () =>
  request(
    {
      url: '/game_tasks/points/',
      method: 'GET'
    },
    true
  )

/**
 * 获取我的成就数据
 * @returns
 */
export const getAchievementData = () =>
  request({
    url: '/game_tasks/achievement_data/',
    method: 'GET'
  })

/**
 * 获取积分排名或者速度排名
 * @param season_id: 赛季ID
 * @returns
 */
export const getRanking = (season_id: number | null | undefined, page = 1, size = 10) =>
  request({
    url: '/game_tasks/ranking/',
    method: 'GET',
    params: { season_id, page, size }
  })

/**
 * 获取第一次登录提示
 * @returns
 */
export const getLoginTip = () =>
  request({
    url: '/game_tasks/first_login_tip/',
    method: 'GET'
  })

/**
 * 获取下载数量 remaining_downloads
 */
export const getDownloadCount = () =>
  request({
    url: '/generic/remaining_downloads/',
    method: 'GET'
  })

/**
 * 获取下载链接
 */
export const getDownloadLink = () =>
  request({
    url: '/generic/user_download/',
    method: 'GET'
  })

/**
 * 获取首页数据面板数据
 */
export const getStatisticsData = () =>
  request({
    url: '/statistics_data/home_data/',
    method: 'GET'
  })

/**
 * 获取首页历史积分数据
 */
export const getHistoryPoints = () =>
  request({
    url: '/game_tasks/history_points/',
    method: 'GET'
  })

export const getSeasons = () =>
  request({
    url: '/game_tasks/display_seasons/',
    method: 'GET'
  })

/**
 * 获取当前赛季
 * @returns
 */
export const getGameSeason = () =>
  request({
    url: '/game_tasks/season/',
    method: 'GET'
  })

/**
 * 设置当前赛季
 * @param data
 * {
 *  id: 赛季ID
 * }
 * @returns
 */
export const setGameSeason = (seasonId: number) =>
  request({
    url: '/game_tasks/season/',
    method: 'POST',
    data: {
      id: seasonId
    }
  })
