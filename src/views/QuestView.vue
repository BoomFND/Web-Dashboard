<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// // 立即请求面板数据
// pointsStore.fetchStatisticsData()

// // 设置定时任务，每隔5s请求一次接口，获取面板数据
// let timer: NodeJS.Timeout
// timer = setInterval(() => {
//   pointsStore.fetchStatisticsData()
// }, 10000)

// // 销毁组件时，取消定时器
// onUnmounted(() => {
//   if (timer) clearInterval(timer)
// })

const goToMarket = () => {
  window.open('https://element.market/collections/genesisboomernft', '_blank')
}
</script>

<template>
  <div class="quest-view">
    <div class="block-top">
      <boom-board>
        <div class="grid-item active" v-if="userStore.account.boomerHolder">
          <div class="grid-label">
            PASSCARD SBT
            <boom-tip title="ABOUT PASSCARD SBT">
              <p>
                This Passcard grants access to Bitlayer's gaming season, allowing participation in
                exclusive League of Legends Esports campaigns and eligibility for future airdrops.
              </p>
            </boom-tip>
          </div>
          <div class="grid-value">
            <SvgIcon name="quest-buff"></SvgIcon>
          </div>
        </div>
        <div class="grid-item" v-else>
          <div class="grid-label">
            PASSCARD SBT
            <boom-tip title="ABOUT PASSCARD SBT">
              <p>
                This Passcard grants access to Bitlayer's gaming season, allowing participation in
                exclusive League of Legends Esports campaigns and eligibility for future airdrops.
              </p>
            </boom-tip>
          </div>
          <div class="grid-value" @click="goToMarket">
            <SvgIcon name="quest-pre-buff"></SvgIcon>
          </div>
        </div>
      </boom-board>
      <SocialCard></SocialCard>
      <ShareCard></ShareCard>
      <BoomMoments></BoomMoments>
      <!-- <PostsCard></PostsCard> -->
    </div>
    <RefLeaderboard></RefLeaderboard>
    <!-- <FaqPanel></FaqPanel> -->
  </div>
</template>

<style lang="scss" scoped>
.points-header {
  height: 104px;
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

    background: linear-gradient(
      107deg,
      rgba(255, 202, 71, 0.2) 4.78%,
      rgba(255, 121, 92, 0.2) 96.37%
    );
    border: 1px solid rgba(255, 202, 71, 0.2);
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

.block-top {
  display: flex;
  flex: 1;
  // width: 1080px;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;

  border-radius: 32px;
  border: 2px solid rgba(39, 43, 64, 0.36);
}

.faq-view {
  margin-top: 40px;
}
</style>
