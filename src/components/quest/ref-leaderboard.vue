<script lang="ts" setup>
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'
import { useQuestStore } from '@/stores/quest'

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
</script>

<template>
  <div class="leader-board">
    <div class="lb-header">
      <div class="lbh-left">
        REFERRALS Leaderboard
        <boom-tip title="ABOUT REFERRALS LEADERBOARD">
          <p>
            The referrals leaderboard ranks users based on the GPT earned by inviting friends during
            the current season.
          </p>
        </boom-tip>
      </div>
    </div>
    <div class="rank-wrapper">
      <ref-table :columns="columns" :data="results"></ref-table>
    </div>
    <div class="load-more" @click="questStore.loadMore()">
      <template v-if="!questStore.data.isFinished && !questStore.data.isLoading">
        see more <svg-icon name="unfold"></svg-icon>
      </template>
      <template v-if="questStore.data.isLoading && questStore.data.page > 1">
        <a-spin />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.leader-board {
  display: flex;
  width: 100%;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  border-radius: 32px;
  border: 2px solid rgba(39, 43, 64, 0.36);
}

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
    font-family: Quicksand;
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
    font-family: Quicksand;
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
  display: flex;
  margin-top: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;

  .lb-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 46px;

    .lbh-left {
      display: flex;
      align-items: center;
      color: rgba(255, 255, 255, 0.6);
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 16.8px */
      text-transform: uppercase;

      .svg-icon {
        margin-left: 6px;
        width: 18px;
        height: 18px;
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

  .load-more {
    display: flex;
    width: 100%;
    height: 24px;
    align-items: center;
    justify-content: center;

    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 700;
    line-height: 120%; /* 16.8px */
    text-transform: lowercase;
    cursor: pointer;

    .svg-icon {
      width: 24px;
      height: 24px;
      color: #fff;
    }
  }
}

:deep(.rank-table) {
  border-radius: 32px;
  overflow: hidden;

  .table-header {
    height: 54px;
    background: #191a27;
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
    height: 64px;
    background: #191a27;

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

.board-tip {
  padding-left: 10px;

  li::marker {
    color: #f4dca5;
  }

  span {
    color: #f4dca5;
  }
}
</style>
