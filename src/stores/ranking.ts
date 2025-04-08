import { defineStore } from 'pinia'

import { getRanking } from '@/apis/game'

import { useUserStore } from '@/stores/user'
import { usePointsStore } from '@/stores/points'

export const useRankingStore = defineStore('ranking', () => {
  const data = reactive({
    isLoading: false,
    isFinished: false,
    type: 'SPEED' as 'SPEED' | 'POINTS',
    count: 0,
    page: 1,
    size: 10,
    results: [] as Array<any>
  })

  const userStore = useUserStore()
  const pointsStore = usePointsStore()

  // 调用接口获取我的游戏积分数据
  const getRankingList = async (seasonId: number | undefined | null, page = 1, size = 10) => {
    try {
      data.isLoading = true
      const res: any = await getRanking(seasonId, page, size)
      data.isLoading = false
      const { count, next, results } = res

      data.page = page
      data.size = size
      data.count = count
      data.isFinished = !next
      data.results = (results ?? []).map((item: any) => {
        const {
          account: { avatar, name, walletAddress },
          isSelf,
          avgSpend,
          points,
          ranking,
          rankingRise,
          unit
        } = item

        return {
          isSelf: isSelf || name === userStore.account.name,
          avatar,
          name,
          walletAddress,
          avgSpend,
          points,
          ranking,
          rankingRise,
          unit
        }
      })
    } catch (error) {
      data.isLoading = false
      console.error(error)
    }
  }

  const loadMore = async () => {
    console.log('loadMore')

    // 如果是最后一页，返回
    if (data.isFinished) return

    try {
      data.page += 1
      data.isLoading = true
      const res: any = await getRanking(pointsStore.currentSeason.id, data.page, data.size)
      console.log(res)
      data.isLoading = false
      const { count, next, results } = res
      data.count = count
      if (!next) data.isFinished = true
      data.results = [
        ...data.results,
        ...results.map((item: any) => {
          const {
            account: { avatar, name, walletAddress },
            isSelf,
            avgSpend,
            points,
            ranking,
            rankingRise,
            unit
          } = item

          return {
            isSelf,
            avatar,
            name,
            walletAddress,
            avgSpend,
            points,
            ranking,
            rankingRise,
            unit
          }
        })
      ]
    } catch (error) {
      data.isLoading = false
      console.error(error)
    }
  }

  return {
    data,
    getRankingList,
    loadMore
  }
})
