import { defineStore } from 'pinia'
import {
  getSocialRewardTasks,
  followTwitterReward,
  shareTwitterVideo,
  getQuestVideos,
  followTelegramReward,
  getReferralsList,
  directReward,
  getCheckInRecordsList
} from '@/apis/quest'
import type { SharingTask, Moment, CheckInRecord } from '@/types/models'

export const useQuestStore = defineStore('quest', () => {
  const rewardTaskList = ref<SharingTask[]>([]);
  const twitterPosts = ref<SharingTask[]>([]);
  const momentVideos = ref<Moment[]>([]);
  const checkInRecords = ref<CheckInRecord[]>([]);
  const data = reactive({
    isLoading: false,
    isFinished: false,
    count: 0,
    page: 1,
    size: 10,
    results: [] as Array<any>
  });

  const fetchTaskList = async (seasonId: number = 1, size: number = 15) => {
    try {
      const res: any = await getSocialRewardTasks(seasonId, size)
      rewardTaskList.value = res.results.filter((item: any) => item.sectionName === 'two')
      twitterPosts.value = res.results.filter((item: any) => item.sectionName === 'three')
      return Promise.resolve(true)
    } catch (error) {
      console.error(error)
      return Promise.reject(false)
    }
  }

  // 获取邀请人数量
  // 获取邀请人数量
  const followTwitter = async () => {
    try {
      await followTwitterReward()
    } catch (error) {
      console.error(error)
    }
  }

  // 获取邀请人数量
  const followTelegram = async () => {
    try {
      await followTelegramReward()
    } catch (error) {
      console.error(error)
    }
  }

  // 获取邀请人数量
  const shareVideo = async () => {
    try {
      await shareTwitterVideo()
    } catch (error) {
      console.error(error)
    }
  }

  // 获取boom momnets
  const getBoomMoments = async () => {
    try {
      const res: any = await getQuestVideos()
      momentVideos.value = res.results
    } catch (error) {
      console.error(error)
    }
  }

  // 获取邀请排名
  const getReferrals = async (page = 1, size = 10) => {
    try {
      data.isLoading = true
      const res: any = await getReferralsList(page, size)
      data.isLoading = false
      const { count, next, results } = res

      data.page = page
      data.size = size
      data.count = count
      data.isFinished = !next
      data.results = (results ?? []).map((item: any) => {
        const {
          account: { avatar, name },
          count,
          points,
          ranking,
          rankingRise
        } = item

        return {
          avatar,
          name,
          count,
          points,
          ranking,
          rankingRise,
          isSelf: false
        }
      })
    } catch (error) {
      data.isLoading = false
      console.error(error)
    }
  }

  // 获取签到记录
  const getCheckInRecords = async () => {
    try {
      const res = await getCheckInRecordsList() as CheckInRecord[];
      checkInRecords.value = res;

      return Promise.resolve(true);
    } catch (error) {
      console.error(error)
    }
  }

  const loadMore = async () => {
    // 如果是最后一页，返回
    if (data.isFinished) return

    try {
      data.page += 1
      data.isLoading = true
      const res: any = await getReferralsList(data.page, data.size)
      data.isLoading = false
      const { count, next, results } = res
      data.count = count
      if (!next) data.isFinished = true
      data.results = [
        ...data.results,
        ...results.map((item: any) => {
          const {
            account: { avatar, name },
            count,
            points,
            ranking,
            rankingRise
          } = item

          return {
            avatar,
            name,
            count,
            points,
            ranking,
            rankingRise
          }
        })
      ]
    } catch (error) {
      data.isLoading = false
      console.error(error)
    }
  }

  const directRewardQuest = async (code: string) => {
    try {
      await directReward(code)
    } catch (error) {
      console.error(error)
    }
  }

  return {
    rewardTaskList,
    twitterPosts,
    momentVideos,
    data,
    checkInRecords,
    fetchTaskList,
    followTwitter,
    followTelegram,
    shareVideo,
    getBoomMoments,
    getReferrals,
    getCheckInRecords,
    loadMore,
    directRewardQuest
  }
})
