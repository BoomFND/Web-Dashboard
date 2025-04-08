<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { usePointsStore } from '@/stores/points';
import { useQuestStore } from '@/stores/quest';
import { onMounted, onUnmounted, ref } from 'vue';
import TimeAgo from "javascript-time-ago";

const userStore = useUserStore();
const pointsStore = usePointsStore();
const questStore = useQuestStore();

const timeAgo = new TimeAgo('en-US');

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
  window.open('https://element.market/collections/genesisboomernft', '_blank');
}

// 立即请求面板数据
onMounted(() => {
  questStore.getCheckInRecords()
});

// 设置定时任务，每隔5s请求一次接口，获取面板数据
const timer = setInterval(() => {
  questStore.getCheckInRecords();
}, 5000)

// 销毁组件时，取消定时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const checkInRecordSectionRef = ref<HTMLElement>();
</script>

<template>
  <section class="socialTasksView">
    <section ref="checkInRecordSectionRef" class="checkInRecordSection">
      <template v-if="questStore.checkInRecords.length > 0">
        <n-marquee :auto-fill="true">
          <div class="checkInRecordList">
            <div class="checkInRecordItem" v-for="item in questStore.checkInRecords" :key="item.walletAddress">
              <div class="checkInRecordItemText">{{ item.walletAddress?.slice(0, 5) + '***' +
                item.walletAddress?.slice(-3) }}</div>
              <div class="checkInRecordItemAction">Check In</div>
              <div class="checkInRecordItemDate">{{ timeAgo.format(new Date(item.createdAt), "mini-now") === 'now' ?
                'Just now' : `${timeAgo.format(new Date(item.createdAt), "mini-now")} ago` }}</div>
            </div>
          </div>
        </n-marquee>
      </template>
    </section>
    <SocialCard />
    <ShareCard />
    <BoomMoments />
    <!-- <PostsCard></PostsCard> -->
    <RefLeaderboard />
    <!-- <FaqPanel></FaqPanel> -->
  </section>
</template>

<style lang="scss" scoped>
.socialTasksView {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;

  .checkInRecordSection {
    display: flex;
    padding: 12px 0px;
    justify-content: center;
    align-items: flex-start;
    gap: 1.5em;
    align-self: stretch;
    background: rgba(10, 194, 194, 0.08);

    :deep(.n-marquee__group) {
      gap: 24px;

      &:not(:first-child) {
        margin-left: 24px;
      }
    }

    .checkInRecordList {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .checkInRecordItem {
      display: flex;
      padding: 4px 6px;
      align-items: center;
      gap: 12px;
      border-radius: 6px;
      background: #fff;

      .checkInRecordItemText {
        color: #0ac2c2;
        font-feature-settings:
          'ss01' on,
          'cv01' on,
          'cv11' on;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
      }

      .checkInRecordItemAction {
        color: #1d1d1f;
        font-feature-settings:
          'ss01' on,
          'cv01' on,
          'cv11' on;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: 20px;
      }

      .checkInRecordItemDate {
        color: #0ac2c2;
        font-feature-settings:
          'ss01' on,
          'cv01' on,
          'cv11' on;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
      }
    }
  }
}

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

    background: linear-gradient(107deg,
      rgba(255, 202, 71, 0.2) 4.78%,
      rgba(255, 121, 92, 0.2) 96.37%);
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
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%;
    /* 16.8px */
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
    line-height: 120%;
    /* 43.2px */
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

@media screen and (max-width: 834px) {
  .socialTasksView {
    gap: clamp(16px, calc(24px - 8 / 459 * (834px - 100vw)), 24px);
  }
}
</style>