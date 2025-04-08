import { request } from './request'

/**
 * 获取用户游戏事件类型
 * @returns
 */
export const getGameEvents = () =>
  request({
    url: '/game_tasks/events/',
    method: 'GET'
  })

/**
 * 获取用户任务积分
 * @param
 * @returns
 */
export const getTaskPoints = () =>
  request({
    url: '/game_tasks/points/',
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
 * 获取系统任务
 * @param
 * type: "GLOBAL" "DOTA2" "VALORANT"
 * @returns
 */
export const getGameTasks = (type: string) =>
  request({
    url: '/game_tasks/system_tasks/',
    method: 'GET',
    params: { reward_type: type }
  })

/**
 * 手动点击领取积分
 * @param id 系统任务id
 * @returns
 */
export const claimReward = (id: number) =>
  request({
    url: '/game_tasks/system_tasks/claim_reward/',
    method: 'POST',
    data: { id }
  })

/**
 * 手动刷新系统任务
 * @param id 系统任务id
 * @returns
 */
export const refreshTask = (id: number) =>
  request({
    url: '/game_tasks/system_tasks/refresh/',
    method: 'POST',
    data: { id }
  })

/**
 * 获取modal信息
 * @params type TIP | Link
 * @returns
 */
export const getModalInfo = (type: string) =>
  request({
    url: `/generic/basic_info/?type=${type}`,
    method: 'GET'
  })

/**
 * 获取所有赛季
 * @returns
 */
export const getSeasons = () =>
  request({
    url: '/game_tasks/display_seasons/',
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
/**
 * Perceptron nft持有数量
 * @returns
 */

export const getPerceptronCount = () =>
  request({
    url: '/assets/perceptron_count/',
    method: 'GET'
  })
/**
 * 获取当前赛季的游戏配置
 * @returns
 */
export const getSeasonGameConfig = (data: any) =>
  request({
    url: `/game_tasks/season_game_config/?season_id=${data}`,
    method: 'GET'
  })
export const getGameSeasonPoints = (seasonId: number, gameType: string) =>
  request({
    url: '/game_tasks/season_game_points/',
    method: 'POST',
    data: {
      season_id: seasonId,
      gameType: gameType
    }
  })

export const getRetweetList = () =>
  request({
    url: `/social/retweet_list/`,
    method: 'GET'
  })

/**
 * 设置密码
 * @param pw 密码
 * @returns
 */
export const setPwd = (pw: string) =>
  request(
    {
      url: '/account/set_pw/',
      method: 'POST',
      data: { pw }
    },
    true,
    true
  )
