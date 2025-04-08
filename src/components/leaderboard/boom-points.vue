<script lang="ts" setup>
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'

const pointsStore = usePointsStore()
const userStore = useUserStore()

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

// 适配小屏幕，修改share结构
const isWap = ref(false)

const handleResize = () => {
  isWap.value = window.innerWidth <= 460
}

onMounted(() => {
  isWap.value = window.innerWidth <= 460
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="points-header">
    <div class="points-wrapper" v-if="!isWap">
      <div class="left">
        <svg-icon name="home-points" />
        <div class="">
          <div class="label">
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
          <div class="value">
            {{ pointsStore.myGameInfo.points ?? '--' }}
          </div>
        </div>
      </div>
      <div class="right">
        <div class="label">
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
        <div class="value">{{ `#${pointsStore.myGameInfo.ranking ?? '--'}` }}</div>
      </div>
    </div>
    <div class="w-wrapper" v-else>
      <div class="left">
        <div class="game-points">
          <div class="label">
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
          <div class="value">
            {{ pointsStore.myGameInfo.points ?? '--' }}
          </div>
        </div>
        <div class="rank">
          <div class="label">
            My ranking
            <boom-tip title="about My ranking">
              <p>
                <span class="primary-color">GPT can be used to participate in rankings</span>
                and earn leaderboard rewards, showcasing the latest trends in your ranking.
              </p>
              <p>
                Note: This section displays your overall GPT score ranking
                <span class="primary-color"> for the current season</span>
                . Rankings are determined by the amount of GPT each user has earned—higher GPT
                scores result in higher rankings. In cases where GPT scores are identical, priority
                is given to users who log in earlier in the day. This rule ensures a dynamic and
                competitive leaderboard.
              </p>
            </boom-tip>
          </div>
          <div class="value">{{ `#${pointsStore.myGameInfo.ranking ?? '--'}` }}</div>
        </div>
      </div>
      <div class="right">
        <svg-icon name="home-points" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.points-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(39, 43, 64, 0.36);

  .left,
  .right {
    .label {
      display: flex;
      align-items: center;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 16.8px */
      height: 34px;
      text-transform: uppercase;

      .svg-icon {
        margin-left: 6px;
        width: 18px;
        height: 18px;
      }
    }

    .value {
      margin-top: 6px;
      color: #fff;
      font-size: 48px;
      font-style: normal;
      font-weight: 600;
      line-height: 120%; /* 57.6px */
      opacity: 0.6;
    }
  }

  .left {
    display: flex;
    align-items: center;
    gap: 24px;

    .svg-icon {
      width: 54px;
      height: 54px;
    }
  }

  .right .value {
    text-align: right;
  }
}

.w-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(39, 43, 64, 0.36);

  .left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    flex: 1 0 0;

    .game-points {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;

      .label {
        color: rgba(255, 255, 255, 0.6);
        font-family: Quicksand;
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 16.8px */
        text-transform: uppercase;
      }

      .value {
        color: var(--100, #fff);
        font-family: Quicksand;
        font-size: 48px;
        font-style: normal;
        font-weight: 600;
        line-height: 120%; /* 57.6px */
      }
    }

    .rank {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 6px;

      .label {
        color: rgba(255, 255, 255, 0.6);
        font-family: Quicksand;
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: 16px; /* 114.286% */
        text-transform: uppercase;
      }

      .value {
        color: var(--100, #fff);
        font-family: Quicksand;
        font-size: 32px;
        font-style: normal;
        font-weight: 600;
        line-height: 120%; /* 38.4px */
      }
    }
  }

  .right {
    display: flex;
    padding: 0px 16px;
    justify-content: center;
    align-items: center;
    align-self: stretch;

    .svg-icon {
      width: 62.468px;
      height: 62.468px;
      flex-shrink: 0;
    }
  }
}
</style>
