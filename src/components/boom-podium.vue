<script lang="ts" setup>
import { useRankingStore } from '@/stores/ranking'
import { useNumberFormat } from '@/hooks/useNumberFormat'
const { formatNumber } = useNumberFormat()
const rankingStore = useRankingStore()

// 适配小屏幕，修改share结构
const isWap = ref(false)

const handleResize = () => {
  isWap.value = window.innerWidth <= 768
}

onMounted(() => {
  isWap.value = window.innerWidth <= 768
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="podium" v-if="!isWap">
    <div class="item">
      <boom-avatar
        :size="68"
        :src="rankingStore.data.results[1]?.avatar"
        :username="rankingStore.data.results[1]?.name"
      ></boom-avatar>
      <div class="rank">2</div>
      <div class="name-wrapper">
        <div class="name">{{ rankingStore.data.results[1]?.name }}</div>
        <div class="wallet">{{ rankingStore.data.results[1]?.walletAddress || '--' }}</div>
      </div>

      <div class="score">
        <div class="speed">{{ formatNumber(rankingStore.data.results[1]?.avgSpend) }} s</div>
        <div class="gpt">
          {{ formatNumber(rankingStore.data.results[1]?.points) }}
          <svg-icon name="home-points"></svg-icon>
        </div>
      </div>
    </div>
    <div class="item">
      <boom-avatar
        :size="68"
        :src="rankingStore.data.results[0]?.avatar"
        :username="rankingStore.data.results[0]?.name"
      ></boom-avatar>
      <div class="rank">1</div>
      <div class="name-wrapper">
        <div class="name">{{ rankingStore.data.results[0]?.name }}</div>
        <div class="wallet">{{ rankingStore.data.results[0]?.walletAddress || '--' }}</div>
      </div>
      <div class="score">
        <div class="speed">{{ formatNumber(rankingStore.data.results[0]?.avgSpend) }} s</div>
        <div class="gpt">
          {{ formatNumber(rankingStore.data.results[0]?.points) }}
          <svg-icon name="home-points"></svg-icon>
        </div>
      </div>
    </div>
    <div class="item">
      <boom-avatar
        :size="68"
        :src="rankingStore.data.results[2]?.avatar"
        :username="rankingStore.data.results[2]?.name"
      ></boom-avatar>
      <div class="rank">3</div>
      <div class="name-wrapper">
        <div class="name">{{ rankingStore.data.results[2]?.name }}</div>
        <div class="wallet">{{ rankingStore.data.results[2]?.walletAddress || '--' }}</div>
      </div>
      <div class="score">
        <div class="speed">{{ formatNumber(rankingStore.data.results[2]?.avgSpend) }} s</div>
        <div class="gpt">
          {{ formatNumber(rankingStore.data.results[2]?.points) }}
          <svg-icon name="home-points"></svg-icon>
        </div>
      </div>
    </div>
  </div>
  <div class="w-podium" v-else>
    <div class="item">
      <div class="item__left">1</div>
      <div class="item__right">
        <div class="item__right-top">
          <boom-avatar
            :size="38"
            :src="rankingStore.data.results[0]?.avatar"
            :username="rankingStore.data.results[0]?.name"
          />
          <div class="name-wrapper">
            <div class="name">{{ rankingStore.data.results[0]?.name }}</div>
            <div class="wallet">{{ rankingStore.data.results[0]?.walletAddress || '--' }}</div>
          </div>
        </div>
        <div class="item__right-bottom">
          <div class="speed">{{ formatNumber(rankingStore.data.results[0]?.avgSpend) }} s</div>
          <div class="gpt">
            {{ formatNumber(rankingStore.data.results[0]?.points) }}
            <svg-icon name="home-points"></svg-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="item__left">2</div>
      <div class="item__right">
        <div class="item__right-top">
          <boom-avatar
            :size="38"
            :src="rankingStore.data.results[1]?.avatar"
            :username="rankingStore.data.results[1]?.name"
          />
          <div class="name-wrapper">
            <div class="name">{{ rankingStore.data.results[1]?.name }}</div>
            <div class="wallet">{{ rankingStore.data.results[1]?.walletAddress || '--' }}</div>
          </div>
        </div>
        <div class="item__right-bottom">
          <div class="speed">{{ formatNumber(rankingStore.data.results[1]?.avgSpend) }} s</div>
          <div class="gpt">
            {{ formatNumber(rankingStore.data.results[1]?.points) }}
            <svg-icon name="home-points"></svg-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="item__left">3</div>
      <div class="item__right">
        <div class="item__right-top">
          <boom-avatar
            :size="38"
            :src="rankingStore.data.results[2]?.avatar"
            :username="rankingStore.data.results[2]?.name"
          />
          <div class="name-wrapper">
            <div class="name">{{ rankingStore.data.results[2]?.name }}</div>
            <div class="wallet">{{ rankingStore.data.results[2]?.walletAddress || '--' }}</div>
          </div>
        </div>
        <div class="item__right-bottom">
          <div class="speed">{{ formatNumber(rankingStore.data.results[2]?.avgSpend) }} s</div>
          <div class="gpt">
            {{ formatNumber(rankingStore.data.results[2]?.points) }}
            <svg-icon name="home-points"></svg-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.podium {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px 0;
  height: 360px;

  .item {
    padding-top: 36px;
    width: 29.46%; //clamp(304px, 20.11vw, 464px);
    height: 253px;
    background-size: cover;
    background-position: center;
    border-radius: 32px;

    .rank,
    .name-wrapper {
      color: #fff;
      text-align: center;
      text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
      font-weight: 700;
      line-height: 120%; /* 57.6px */
      text-transform: lowercase;
    }

    .rank {
      margin: 6px 0;
      font-size: 36px;
    }

    .name-wrapper {
      flex: 1;
      font-size: 20px;

      .wallet {
        font-size: 16px;
        font-weight: normal;
      }

      @media screen and (max-width: 996px) {
        padding: 0 10px;

        .name {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .score {
      // margin-top: 12px;
      padding: 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      color: rgba(255, 255, 255, 0.6);
      text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
      font-size: 16px;
      font-weight: 700;
      line-height: 120%; /* 19.2px */
      text-transform: lowercase;

      .gpt {
        display: flex;
        align-items: center;
        color: #fff;

        .svg-icon {
          margin-left: 4px;
          font-size: 18px;
        }
      }
    }

    &:nth-child(1) {
      background-image: url('@/assets/images/rank/2st.png');
    }
    &:nth-child(2) {
      padding-top: 60px;
      width: 33.24%; //clamp(343px, 23.82vw, 503px);
      height: 311px;
      background-image: url('@/assets/images/rank/1st.png');

      .rank {
        font-size: 48px;
      }
      .name {
        font-size: 24px;
      }

      .score {
        // margin-top: 44px;
        margin-top: 20px;
        padding: 0 28px;
      }
    }
    &:nth-child(3) {
      background-image: url('@/assets/images/rank/3st.png');
    }
  }
}

.w-podium {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;

  .item {
    display: flex;
    padding: min(6.4vw, 24px);
    align-items: flex-start;
    gap: min(6.4vw, 24px);
    align-self: stretch;
    border-radius: min(32px, 8.53vw);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    &:nth-child(1) {
      background-image: url('@/assets/images/rank/1st.png');
    }
    &:nth-child(2) {
      background-image: url('@/assets/images/rank/2st.png');
    }
    &:nth-child(3) {
      background-image: url('@/assets/images/rank/3st.png');
    }

    &__left {
      color: #fff;
      text-align: center;
      text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
      font-family: Quicksand;
      font-size: min(10.67vw, 40px);
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 48px */
      text-transform: lowercase;
    }

    &__right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: min(2.13vw, 8px);

      &-top {
        display: flex;
        align-items: center;
        gap: min(2.13vw, 8px);

        :deep(.svg-icon),
        :deep(.avatar--wrapper) {
          width: 10.13vw !important;
          height: 10.13vw !important;
        }
      }

      &-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        gap: min(6.4vw, 24px);
        text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
        font-family: Quicksand;
        font-size: clamp(12px, 3.2vw, 14px);
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 14.4px */

        .speed {
          color: rgba(255, 255, 255, 0.6);
          text-transform: lowercase;
        }

        .gpt {
          color: #fff;
        }
      }

      .name-wrapper {
        color: #fff;
        text-align: center;
        text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
        font-family: Quicksand;
        font-size: clamp(14px, 4.27vw, 20px);
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 16.8px */
        text-transform: lowercase;

        .name {
          text-align: left;
          width: clamp(100px, 40vw, 400px);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wallet {
          text-align: left;
          font-size: clamp(12px, 3.73vw, 18px);
          font-weight: normal;
        }
      }
    }
  }
}
</style>
