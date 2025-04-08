import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

import {
  getMyPoints,
  getAchievementData,
  getStatisticsData,
  getHistoryPoints,
  getSeasons,
  setGameSeason,
  getGameSeason
} from '@/apis/game'
import type { GameInfo, Statistics, GameType, Rewards, Season } from '@/types/models'

dayjs.extend(isBetween)

export const usePointsStore = defineStore('points', () => {
  // 当前游戏类型
  const gameType = ref<GameType>('LOL')

  const historyPoints = ref<Rewards[]>([])

  const currentSeason = ref<Season>({
    id: 0,
    name: '',
    startAt: '',
    endAt: '',
    default: false,
    display: false,
    highlight: false,
    order: 0,
    games: []
  })

  const seasons = ref<Season[]>([])

  // 设置游戏类型
  const setGameType = (type: GameType) => {
    gameType.value = type
  }

  // 我的游戏数据
  const myGameInfo = ref<GameInfo>({
    id: null,
    lastPlayed: null,
    miningPoints: 0,
    miningTime: 0,
    points: 0,
    totalPoints: 0,
    ranking: 0,
    rankingRise: 0,
    totalRanking: 0,
    totalRankingRise: 0,
    userInviteRanking: 0,
    userInviteRankingRise: 0,
    userInvitePoints: 0,
    userInviteCount: '',
    type: 'LOL',
    unit: 'GPT',
    season: {
      id: 0,
      name: '',
      startAt: '',
      endAt: '',
      default: false,
      display: false,
      highlight: false,
      order: 0,
      games: []
    },
    questPoints: 0,
    mintInviteCount: 0
  })

  const achievement = ref()

  // 数据面板动态数据
  const statistics = ref<Statistics>({
    userRegistered: 0,
    boomerHolders: 0,
    totalTransactions: 0
  })

  // 调用接口获取我的游戏积分数据
  const getGamePoints = async () => {
    try {
      const res = await getMyPoints()
      myGameInfo.value = res as GameInfo
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * 调用接口获取我的成就数据
   */
  const getMyAchievement = async () => {
    try {
      const res = await getAchievementData()
      achievement.value = res
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * 调用接口获取面板数据
   */
  const fetchStatisticsData = async () => {
    try {
      const res = await getStatisticsData()
      statistics.value = res as Statistics
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * 调用接口获取面板数据
   */
  const fetchHistoryPoints = async () => {
    try {
      const res = await getHistoryPoints()
      historyPoints.value = (res as Array<Rewards>).filter((item) => item.name !== 'MVB Season')
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * 调用接口获取面板数据
   */
  const fetchSeasons = async () => {
    try {
      const res: any = await getSeasons()
      seasons.value = res.results?.filter((item: Season) => item.display) || []

      if (seasons.value?.length) {
        seasons.value = seasons.value.map((item) => {
          item.live = dayjs().isBetween(item.startAt, item.endAt)
          return item
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const setCurrentSeason = async (season: Season) => {
    try {
      await setGameSeason(season.id)
      currentSeason.value = season
      setGameType(
        season.name.toLowerCase().includes('wukong') ? 'WUKONG' : (season.name as GameType)
      )
    } catch (error) {
      console.error(error)
    }
  }

  const getCurrentSeason = async () => {
    try {
      const season: Season = (await getGameSeason()) as Season
      if (season.id) {
        setGameType(
          season.name.toLowerCase().includes('wukong') ? 'WUKONG' : (season.name as GameType)
        )
        return (currentSeason.value = season)
      }

      if (seasons.value?.length) {
        const season = seasons.value?.find((item) => item.default) || seasons.value?.[0] || {}
        if (season.id) setCurrentSeason(season)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const emptyPoints = () => {
    myGameInfo.value = {
      id: null,
      lastPlayed: null,
      miningPoints: 0,
      miningTime: 0,
      points: 0,
      totalPoints: 0,
      ranking: 0,
      rankingRise: 0,
      totalRanking: 0,
      totalRankingRise: 0,
      userInviteRanking: 0,
      userInviteRankingRise: 0,
      userInvitePoints: 0,
      userInviteCount: '',
      mintInviteCount: 0,
      type: 'LOL',
      unit: 'GPT',
      season: {
        id: 0,
        name: '',
        startAt: '',
        endAt: '',
        default: false,
        display: false,
        highlight: false,
        order: 0,
        games: []
      },
      questPoints: 0
    }
  }

  return {
    gameType,
    myGameInfo,
    achievement,
    statistics,
    historyPoints,
    currentSeason,
    seasons,
    setGameType,
    getGamePoints,
    getMyAchievement,
    fetchStatisticsData,
    fetchHistoryPoints,
    fetchSeasons,
    setCurrentSeason,
    getCurrentSeason,
    emptyPoints
  }
})
