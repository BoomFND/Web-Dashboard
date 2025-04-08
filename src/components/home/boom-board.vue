<script lang="ts" setup>
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'
import { useNumberFormat } from '@/hooks/useNumberFormat'

const { formatNumber } = useNumberFormat()
const userStore = useUserStore()

const pointsStore = usePointsStore()

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => [userStore.accessToken, pointsStore.currentSeason],
  (newV) => {
    if (newV[0] && newV[1]) {
      pointsStore.getGamePoints()
    }
  },
  { immediate: true }
)

// 监听用户将网站切换到前台
document.addEventListener('visibilitychange', function () {
  !document.hidden && pointsStore.getGamePoints()
})
</script>

<template>
  <div class="points-header">
    <div class="grid-list">
      <slot></slot>
      <div class="grid-item">
        <div class="grid-label">
          My gamer Points
          <boom-tip title="About my Gamer Points">
            <p>
              <span class="primary-color">Gamer Points (GPT)</span> re the core rewards in
              GamerBoom, with each season offering unique seasonal points.
              <span class="primary-color">
                During each season, your scores are tracked and ranked
              </span>
              . By playing popular games, you can mine game data. This is your opportunity to
              actively engage with our product.
            </p>
          </boom-tip>
        </div>
        <div class="grid-value">
          {{ formatNumber(pointsStore.myGameInfo.points) ?? '--' }}
          <svg-icon name="home-points"></svg-icon>
        </div>
      </div>
      <div class="grid-item">
        <div class="grid-label">
          My ranking
          <boom-tip title="about My ranking">
            <p>
              <span class="primary-color">GPT can be used to participate in rankings</span>
              and earn leaderboard rewards, showcasing the latest trends in your ranking.
            </p>
            <p>
              Note: This section displays your overall GPT score ranking
              <span class="primary-color"> for the current season</span>
              . Rankings are determined by the amount of GPT each user has earned—higher GPT scores
              result in higher rankings. In cases where GPT scores are identical, priority is given
              to users who log in earlier in the day. This rule ensures a dynamic and competitive
              leaderboard.
            </p>
          </boom-tip>
        </div>
        <div class="grid-value">
          {{ `#${pointsStore.myGameInfo.ranking || '--'}` }}
          <div
            class="grid-rank-rise"
            :class="+pointsStore.myGameInfo.rankingRise > 0 ? 'green' : 'red'"
            v-if="pointsStore.myGameInfo.rankingRise !== 0"
          >
            <svg-icon
              :name="`${+pointsStore.myGameInfo.rankingRise > 0 ? 'arrow-up' : 'arrow-down'}`"
            ></svg-icon>
            {{ Math.abs(+pointsStore.myGameInfo.rankingRise) }}
          </div>
        </div>
      </div>
      <!-- <div class="grid-line"></div>
      <div class="grid-item">
        <div class="grid-label">BOOMER HOLDERS</div>
        <div class="grid-value green">
          <boom-count-to v-model="pointsStore.statistics.boomerHolders"></boom-count-to>
        </div>
      </div>
      <div class="grid-item">
        <div class="grid-label">USER REGISTERED</div>
        <div class="grid-value blue">
          <boom-count-to v-model="pointsStore.statistics.userRegistered"></boom-count-to>
        </div>
      </div>
      <div class="grid-item">
        <div class="grid-label">TOTAL TRANSACTIONS</div>
        <div class="grid-value red">
          <boom-count-to v-model="pointsStore.statistics.totalTransactions"></boom-count-to>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.points-header {
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(39, 43, 64, 0.36);
  height: 104px;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 4px;
  }

  .grid {
    &-list {
      // width: 100%;
      // display: flex;
      // justify-content: center;
      // align-items: center;
      // // gap: 46px;
      // align-self: stretch;
      display: flex;
      align-items: center;
      gap: 50px;
      align-self: stretch;
    }

    &-label {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      white-space: nowrap;
      overflow: hidden;
      color: rgba(255, 255, 255, 0.6);
      font-family: Quicksand;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 16.8px */
      text-transform: uppercase;
    }

    &-value {
      margin-top: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--BAI, #fff);
      font-family: Quicksand;
      font-size: 36px;
      font-style: normal;
      font-weight: 600;
      line-height: 120%; /* 43.2px */
      min-height: 43px;

      .svg-icon {
        margin-left: 6px;
      }
    }

    &-line {
      width: 2px;
      height: 67px;
      background: rgba(39, 43, 64, 0.8);
    }

    &-rank-rise {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
      line-height: 120%; /* 16.8px */
    }

    &-item {
      flex: 1;
      padding: 0 12px;
      max-width: 180px;
    }
  }

  .green {
    color: #70f1b4;
  }

  .blue {
    color: #11c5c5;
  }

  .red {
    color: #e3405e;
  }
}
</style>
