<script lang="ts" setup>
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dayjs from 'dayjs'
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'
import { nextTick, onMounted, ref, watch } from 'vue'

gsap.registerPlugin(ScrollTrigger)
dayjs.locale('en')

const pointsStore = usePointsStore()
const userStore = useUserStore()

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => userStore.accessToken,
  (newV) => {
    if (newV) {
      pointsStore.fetchHistoryPoints()
    }
  },
  { immediate: true }
)

const rewardPanelRef = ref()
const tl = gsap.timeline()
const handleRewardAnimation = () => {
  tl.from(rewardPanelRef.value, {
    opacity: 0,
    delay: 2.4
  })
    .from('.reward-panel .header', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'circ.out'
    })
    .from(
      '.reward-panel .content',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.3'
    )
    .from(
      '.reward-panel .content .content__header',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.3'
    )
}

watch(
  () => pointsStore.historyPoints.length,
  async () => {
    await nextTick()
    tl.from(
      '.reward-panel .content .content__body .content__body-row',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'circ.out'
      },
      '<=0.1'
    )
  }
)

onMounted(async () => {
  handleRewardAnimation()
})
</script>

<template>
  <div ref="rewardPanelRef" class="reward-panel">
    <div class="header">Rewards</div>
    <div class="content">
      <div class="content-wrapper">
        <div class="content__header">
          <div class="content__header-th">Season</div>
          <div class="content__header-th">Start/End Date</div>
          <div class="content__header-th">Total Rewards</div>
        </div>
        <div class="content__body">
          <div class="empty-wrapper" v-if="!pointsStore.historyPoints.length">
            <Empty />
          </div>
          <div class="content__body-row" v-for="item in pointsStore.historyPoints" :key="item.id">
            <div class="content__body-td">{{ item.name }}</div>
            <div class="content__body-td">
              {{ `${dayjs(item.startAt).format('MMM DD,YYYY HH:mm:ss A')}/${dayjs(item.endAt).format('MMM DD,YYYY HH:mm:ss A')}`}}
            </div>
            <div class="content__body-td">
              <BoomNumber :number="+item.seasonPoints" />
              <SvgIcon name="dashboard-score" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reward-panel {
  width: 100%;
  display: flex;
  padding: 0px 28px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;

  .header {
    color: #1d1d1f;
    font-family: Urbanist;
    font-size: 28px;
    font-style: normal;
    font-weight: 800;
    line-height: 36px;
    /* 128.571% */
    letter-spacing: var(--letter-spacing--0_08, -0.076px);
  }

  .content {
    display: flex;
    padding: 0px 24px 24px 24px;
    min-height: 700px;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    border-radius: 16px;
    background: #fff;
    overflow-x: auto;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 100%;
      min-width: 625px;
    }

    &__header {
      display: flex;
      justify-content: space-around;
      width: 100%;
      padding: 24px 0;
      border-bottom: 1px solid rgba(210, 210, 215, 0.4);

      &-th {
        flex: 1;
        text-align: center;
        color: #6e6e73;
        font-family: Urbanist;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        /* 142.857% */

        &:first-child {
          text-align: left;
        }

        &:nth-child(2) {
          min-width: 217px;
        }

        &:last-child {
          text-align: right;
        }
      }
    }

    .content__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-self: stretch;
      width: 100%;
      color: #1d1d1f;

      &-row {
        display: flex;
        padding: 24px 0px;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(210, 210, 215, 0.4);
      }

      &-td {
        flex: 1;
        text-align: center;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
        /* 150% */

        &:first-child {
          text-align: left;
        }

        &:nth-child(2) {
          flex: 1;
          text-align: center;
          min-width: 217px;
          align-self: stretch;
        }

        &:last-child {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;

          .svg-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }
        }

        :deep(.boom-number) {

          .unit,
          .number {
            font-size: 16px;
          }
        }
      }

      .empty-wrapper {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: stretch;
      }
    }
  }
}
</style>
