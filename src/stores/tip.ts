import { defineStore } from 'pinia'
import { getLoginTip } from '@/apis/game'
import dayjs from 'dayjs'

interface Tip {
  id: number
  value: string
  type: string
  [key: string]: any
}

export const useLoginTipStore = defineStore(
  'loginTip',
  () => {
    const title = ref('')
    const tips = ref<Array<Tip>>([])
    const type = ref<'challenge' | 'result'>('challenge')

    // 提醒弹窗信息
    const remind = reactive({
      challenge: {
        // 挑战任务弹窗
        time: dayjs().format('YYYY-MM-DD'),
        finished: false
      },
      result: {
        // 挑战成功弹窗
        time: dayjs().format('YYYY-MM-DD'),
        finished: false
      }
    })

    const getTips = async () => {
      try {
        const res: any = await getLoginTip()
        tips.value = res.tips.map((item: { id: any; value: any; type: any }) => {
          const { id, value, type } = item
          return { id, value, type }
        })
        if (!res.completed) {
          type.value = 'challenge'
          title.value = `Today's Limited Challenge: ${res.dayMatches} Matches`
        } else {
          type.value = 'result'
          title.value = "Today's match quota is exhausted"
        }

        return Promise.resolve(res)
      } catch (error) {
        console.error(error)
        return Promise.reject(error)
      }
    }

    const setRemind = () => {
      remind[type.value].finished = true
      remind[type.value].time = dayjs().format('YYYY-MM-DD')
    }

    return {
      type,
      title,
      tips,
      remind,
      getTips,
      setRemind
    }
  },
  { persist: true }
)
