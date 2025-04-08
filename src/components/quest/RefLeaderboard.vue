<script lang="ts" setup>
import { gsap } from 'gsap'
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'
import { useQuestStore } from '@/stores/quest'

let tl: GSAPTimeline | null = null
const handleAnimation = () => {
  if (!tl) return
  tl.from('.leader-board .lb-header', {
    opacity: 0,
    y: 24,
    duration: 0.5,
    ease: 'circ.out',
    delay: 3.21
  })
    .from(
      '.leader-board .rank-wrapper',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.3'
    )
    .from(
      '.leader-board .rank-wrapper .table-header',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.3'
    )
    .from(
      '.leader-board .rank-wrapper .table-body .tb-row',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'circ.out'
      },
      '<=0.1'
    )
    .from('.leader-board .rank-wrapper .table-footer', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.1,
      ease: 'circ.out'
    })
}

const pointsStore = usePointsStore()
const userStore = useUserStore()
const questStore = useQuestStore()

const { getReferrals } = questStore

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => userStore.accessToken,
  (newV) => {
    if (newV) {
      pointsStore.getGamePoints()
    }
  },
  { immediate: true }
)

const results = computed(() => {
  const data = questStore.data.results
  const {
    userInvitePoints: points,
    userInviteRanking: ranking,
    userInviteRankingRise: rankingRise,
    userInviteCount: count
  } = pointsStore.myGameInfo
  const { avatar, name } = userStore.account

  if (userStore.accessToken) {
    return [{ avatar, name, count, points, ranking, rankingRise, isSelf: false }, ...data]
  } else {
    return data
  }
})

// 排名表格表头
const columns = computed(() => [
  {
    title: 'Rank',
    dataIndex: 'ranking',
    align: 'left'
  },
  {
    title: 'gamer',
    dataIndex: 'name',
    align: 'left'
  },
  {
    title: 'total referrals',
    dataIndex: 'count',
    align: 'center'
  },
  {
    title: 'GPT',
    dataIndex: 'points',
    align: 'right'
  }
])

// 排名数据
getReferrals(1, 20)

const leaderBoardRef = ref()
watch(
  () => questStore.data.results.length,
  async (newV) => {
    if (newV <= questStore.data.size) {
      await nextTick()
      tl = gsap.timeline()
      handleAnimation()
    } else if (newV > questStore.data.size) {
      await nextTick()
      const rowItems = leaderBoardRef.value.querySelectorAll(
        '.leader-board .rank-wrapper .table-body .tb-row'
      )
      const doms = Array.from(rowItems).slice(questStore.data.size * (questStore.data.page - 1), -1)

      tl &&
        tl.from(doms, {
          opacity: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.1,
          ease: 'circ.out'
        })
    }
  }
)

onUnmounted(() => {
  tl && tl.kill()
})
</script>

<template>
  <div class="leader-board" ref="leaderBoardRef">
    <div class="lb-header">
      <div class="lbh-left">
        Referral Leaderboard
        <boom-tip title="ABOUT REFERRAL LEADERBOARD">
          <p><b>Step 1.</b> Register through the invitation link</p>
          <p><b>Step 2.</b> Complete a sign-in task</p>
          <p><b>Step 3.</b> Invitation is successful, points increase</p>
        </boom-tip>
      </div>
    </div>
    <div class="rank-wrapper">
      <RefTable :columns="columns" :data="results">
        <template #footer>
          <div v-if="!questStore.data.isFinished" class="load-more" @click="questStore.loadMore()">
            <template v-if="!questStore.data.isFinished && !questStore.data.isLoading">
              see more
            </template>
            <template v-if="questStore.data.isLoading && questStore.data.page > 1">
              <a-spin />
            </template>
          </div>
        </template>
        <template #empty v-if="questStore.data.results.length === 0">
          <div class="empty-wrapper">
            <Empty />
          </div>
        </template>
      </RefTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid-item {
  display: flex;
  padding: 8px 12px;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  align-self: stretch;

  border-radius: 16px;
  background: var(--4, rgba(255, 255, 255, 0.04));

  &.active {
    .grid-label {
      color: #ffca47;
    }

    .grid-value {
      cursor: auto;
    }

    & {
      background: linear-gradient(
        107deg,
        rgba(255, 202, 71, 0.2) 4.78%,
        rgba(255, 121, 92, 0.2) 96.37%
      );
      border: 1px solid rgba(255, 202, 71, 0.2);
    }
  }

  .grid-label {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    overflow: hidden;
    color: #fff;
    text-align: center;
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 16.8px */
    text-transform: uppercase;
  }

  .grid-value {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--BAI, #fff);
    font-family: Urbanist;
    // font-size: 56px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%; /* 43.2px */
    box-sizing: border-box;
    cursor: pointer;

    .svg-icon {
      width: 56px;
      height: 40px;
    }
  }
}

.leader-board {
  width: 100%;
  display: flex;
  padding: 0px 28px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;

  .lb-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 46px;

    .lbh-left {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 32px;
      font-style: normal;
      font-weight: 800;
      line-height: 40px; /* 125% */
      letter-spacing: var(--letter-spacing--0_08, -0.076px);

      :deep(.svg-icon) {
        margin-left: 0;
        width: 24px;
        height: 24px;
      }
    }
  }

  .rank-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 16px;
    flex: 1;
    overflow-x: auto;

    &::-webkit-scrollbar {
      height: 4px;
    }
  }
}

:deep(.rank-table) {
  display: flex;
  padding: 0px 24px 24px 24px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;

  .table-header {
    display: flex;
    padding: 24px 0px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    height: 68px;
    border-bottom: 1px solid rgba(210, 210, 215, 0.4);
    color: var(--color-text);
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px; /* 142.857% */
  }

  .th-item,
  .tb-row {
    display: flex;
    align-items: center;
  }

  .th-item {
    padding: 10px 20px;
    justify-content: center;

    &:first-child {
      justify-content: flex-start;
    }

    &:nth-child(2) {
      justify-content: flex-start;
      padding-left: 0px;
    }

    &:last-child {
      justify-content: flex-end;
    }
  }

  .tb-row {
    margin-top: 2px;
    display: flex;
    padding: 24px 0px;
    height: 72px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    border-bottom: 1px solid rgba(210, 210, 215, 0.4);
    color: var(--color-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 24px; /* 150% */

    &.highlight {
      color: #f4dca5;

      .ranking,
      .points {
        color: #f4dca5;
      }
    }
  }

  .tb-col .ranking {
    min-width: 35px;
  }
}

.empty-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.board-tip {
  padding-left: 10px;

  li::marker {
    color: #f4dca5;
  }

  span {
    color: #f4dca5;
  }
}

@media screen and (min-width: 1921px) {
  .grid-item {
    padding: calc(8 * 100vw / 1920) calc(12 * 100vw / 1920);
    gap: calc(6 * 100vw / 1920);
    border-radius: calc(16 * 100vw / 1920);

    .grid-label {
      font-size: calc(14 * 100vw / 1920);
    }

    .grid-value {
      // font-size: calc(56 * 100vw / 1920);

      .svg-icon {
        width: calc(56 * 100vw / 1920);
        height: calc(40 * 100vw / 1920);
      }
    }
  }

  .leader-board {
    padding: 0px calc(28 * 100vw / 1920) calc(24 * 100vw / 1920);
    gap: calc(24 * 100vw / 1920);

    .lb-header {
      height: calc(46 * 100vw / 1920);

      .lbh-left {
        gap: calc(8 * 100vw / 1920);
        font-size: calc(32 * 100vw / 1920);
        line-height: calc(40 * 100vw / 1920);

        :deep(.svg-icon) {
          width: calc(24 * 100vw / 1920);
          height: calc(24 * 100vw / 1920);
        }
      }
    }

    .rank-wrapper {
      gap: calc(16 * 100vw / 1920);

      &::-webkit-scrollbar {
        height: calc(4 * 100vw / 1920);
      }
    }
  }

  :deep(.rank-table) {
    padding: 0px calc(24 * 100vw / 1920) calc(24 * 100vw / 1920) calc(24 * 100vw / 1920);
    border-radius: calc(16 * 100vw / 1920);

    .table-header {
      padding: calc(24 * 100vw / 1920) 0px;
      height: calc(68 * 100vw / 1920);
      font-size: calc(14 * 100vw / 1920);
      line-height: calc(20 * 100vw / 1920);
    }

    .th-item {
      padding: calc(10 * 100vw / 1920) calc(20 * 100vw / 1920);
    }

    .tb-row {
      margin-top: calc(2 * 100vw / 1920);
      padding: calc(24 * 100vw / 1920) 0px;
      height: calc(72 * 100vw / 1920);
      font-size: calc(16 * 100vw / 1920);
      line-height: calc(24 * 100vw / 1920);
    }

    .tb-col .ranking {
      min-width: calc(35 * 100vw / 1920);
    }
  }

  .board-tip {
    padding-left: calc(10 * 100vw / 1920);
  }
}

@media screen and (max-width: 834px) {
  .leader-board {
    padding: 0 clamp(16px, calc(28px - 12 / 459 * (834px - 100vw)), 28px) 24px;

    .lb-header .lbh-left {
      font-size: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);
    }
  }
}
</style>
