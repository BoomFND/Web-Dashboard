<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { usePointsStore } from '@/stores/points'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const userStore = useUserStore()
const pointsStore = usePointsStore()

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => [userStore.accessToken, pointsStore.currentSeason],
  async (newV) => {
    if (newV) {
      await pointsStore.getDailyPointsStats()

      resolveData(pointsStore.dailyPoints)
    }
  },
  { immediate: true }
)

const chartsRef = ref()
const myChart = ref()
const noData = ref(false)
const xData = ref([])
const yData = ref([])
const normalColor = '#8D8D8D'
const options = reactive({
  backgroundColor: '#090C0F',
  tooltip: {
    // trigger: 'axis'
    // axisPointer: {
    //   type: 'cross',
    //   crossStyle: {
    //     color: '#999'
    //   }
    // }
  },
  grid: {
    top: '10%',
    left: '0',
    right: '0',
    bottom: '0',
    containLabel: true
  },
  xAxis: [
    {
      data: xData,
      axisPointer: {
        type: 'shadow'
      },
      axisLabel: {
        interval: 0,
        align: 'center',
        textStyle: {
          color: normalColor,
          fontSize: 14,
          fontWeight: 600,
          fontfamily: 'Urbanist'
        },
        formatter: (value: string) => {
          console.log(value)

          return value.split(' ').join('\n\n')
        }
      },
      axisLine: {
        lineStyle: {
          color: '#090C0F'
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      //   nameTextStyle: {
      //     color: normalColor,
      //     fontSize: 12
      //   },
      // "min": 0,
      // "max": 50,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k'
          }
          return value
        },
        textStyle: {
          color: normalColor,
          fontSize: 14
        }
      },
      axisTick: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: '#1C1C1C',
          boxShadow: {
            color: '#1C1C1C',
            offsetX: 0,
            offsetY: 0,
            blur: 8,
            spread: 0
          }
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#1C1C1C',
          boxShadow: {
            color: '#1C1C1C',
            offsetX: 0,
            offsetY: 0,
            blur: 8,
            spread: 0
          }
        }
      }
    }
  ],
  series: {
    name: 'Mining Earnings',
    type: 'bar',
    data: yData,
    barWidth: '12',
    itemStyle: {
      normal: {
        barBorderRadius: [60, 60, 60, 60],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#06FFB6'
            },

            {
              offset: 1,
              color: '#090C0F'
            }
          ],
          globalCoord: false
        }
      }
    }
  }
})

const resolveData = (data: any[]) => {
  xData.value = []
  yData.value = []
  data.forEach((item: any) => {
    xData.value.push(dayjs(item.date).format('D MMM') as never)
    yData.value.push(item.miningPoints as never)
  })

  if (yData.value.every((item) => item === 0)) {
    noData.value = true
  } else {
    setOptions()
    noData.value = false
  }
}

const setOptions = () => {
  myChart.value.setOption(options)
}

const initCharts = () => {
  console.log(chartsRef.value)

  myChart.value = echarts.init(chartsRef.value)
}

onMounted(() => {
  initCharts()
})
</script>

<template>
  <div class="statistics">
    <div class="header">
      <div class="title">
        Earnings Statistics
        <boom-tip title="ABOUT REFERRALS LEADERBOARD">
          <p>
            The referrals leaderboard ranks users based on the GPT earned by inviting friends during
            the current season.
          </p>
        </boom-tip>
      </div>
      <div class="button-group">
        <div class="item active">Mining Earnings</div>
        <div class="item bonus">Referrals Bonus</div>
        <div class="item rewards">Delegation rewards</div>
      </div>
    </div>
    <div class="no-data" v-if="noData">
      <div class="text">No Data</div>
    </div>
    <div v-else ref="chartsRef" class="charts" style="width: 100%; height: 400px"></div>
  </div>
</template>

<style lang="scss" scoped>
.statistics {
  padding: 28px;
  .header {
    display: flex;
    justify-content: space-between;
  }

  .title {
    color: #fff;
    font-family: Urbanist;
    font-size: 32px;
    font-style: normal;
    font-weight: 800;
    line-height: 30px; /* 93.75% */
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 28px;

    .item {
      display: flex;
      gap: 4px;
      align-items: center;
      color: #8d8d8d;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px; /* 142.857% */

      &::before {
        content: '';
        display: inline-block;
        width: 14px;
        height: 14px;
        background: #8d8d8d;
        border-radius: 50%;
      }

      &.active {
        color: #fff;

        &::before {
          background: linear-gradient(180deg, #06ffb6 0%, #00a474 100%);
          box-shadow: 0px 0px 8px 0px #ff7d45;
        }
      }
    }
  }

  .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    width: 100%;
    height: 100%;
  }

  .charts {
    margin-top: 80px;
    width: 100%;
    height: 100%;
  }
}
</style>
