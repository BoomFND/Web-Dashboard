<script lang="ts" setup>
import { useNftStore } from '@/stores/nft'
import { reactive, watchEffect } from 'vue'

const nftStore = useNftStore()

// 获取nft数据
nftStore.fetchWalletInfo()

// 创建一个响应式对象来存储倒计时显示字符串
const countdownDisplays = reactive(new Map<number, string>())

// 转换倒计时秒数为 "1 day 01:45:02" 格式的函数
const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) {
    return ''
  }
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m Remaining`
}

watchEffect(() => {
  nftStore.nfts.forEach((nft) => {
    // 如果countdownDisplays中还没有这个nft的倒计时，则初始化它
    if (!countdownDisplays.has(nft.id)) {
      countdownDisplays.set(nft.id, formatCountdown(nft.countDownSeconds))
      // 设置倒计时
      const intervalId = setInterval(() => {
        if (nft.countDownSeconds > 0) {
          nft.countDownSeconds--
          countdownDisplays.set(nft.id, formatCountdown(nft.countDownSeconds))
        } else {
          clearInterval(intervalId)
          // 为了避免内存泄漏，当倒计时结束时，我们从countdownDisplays中移除这个项
          countdownDisplays.delete(nft.id)
        }
      }, 1000)
    }
  })
})
</script>

<template>
  <div class="campaign-view">
    <a-carousel :autoplay="false" arrows>
      <carousel-item v-for="nft in nftStore.nfts" :key="nft.id" :nft="nft" :countdown-displays="countdownDisplays"
        class="item" />
    </a-carousel>
  </div>
</template>

<style lang="scss" scoped>
.campaign-view {
  padding: 28px;
  height: 100%;
  box-sizing: border-box;
}

.ant-carousel {
  height: 100%;
}

:deep(.slick-slide) {
  height: 100%;
  text-align: center;
  // height: 654px;
  overflow: hidden;
}

@media screen and (min-width: 1921px) {
  .campaign-view {
    padding: calc(28 * 100vw / 1920);
  }
}

@media screen and (max-width: 834px) {
  .campaign-view {
    padding: 28px clamp(16px, calc(28px - 12 / 459 * (834px - 100vw)), 28px);
  }
}
</style>