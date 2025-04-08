<!--
 * @Author: jingren renjing_123455@163.com
 * @Date: 2024-09-02 09:15:12
 * @LastEditors: jingren renjing_123455@163.com
 * @LastEditTime: 2024-09-03 10:43:38
 * @FilePath: /rinku/apps/web/src/views/NftView.vue
-->
<script lang="ts" setup>
import { useNftStore } from '@/stores/nft'
import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue'

const nftStore = useNftStore()

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
  <a-carousel :autoplay="false" arrows>
    <!-- <template #prevArrow>
      <div class="custom-slick-arrow" style="left: 10px; z-index: 1; top: calc(100% - 80px)">
        <left-circle-outlined />
      </div>
    </template>
    <template #nextArrow>
      <div class="custom-slick-arrow" style="right: 10px; top: calc(100% - 80px)">
        <right-circle-outlined />
      </div>
    </template> -->
    <carousel-item
      v-for="nft in nftStore.nfts"
      :key="nft.id"
      :nft="nft"
      :countdown-displays="countdownDisplays"
      class="item"
    ></carousel-item>
  </a-carousel>
</template>

<style lang="scss" scoped>
:deep(.slick-slide) {
  text-align: center;
  // height: 654px;
  overflow: hidden;

  // @media screen and (max-width: 1140px) {
  //   height: 1120px;
  // }
}

// :deep(.slick-arrow.custom-slick-arrow) {
//   width: 60px;
//   height: 60px;
//   font-size: 60px;
//   color: rgba(#ffffff, 0.9);
//   background-color: rgba(31, 45, 61, 0.11);
//   transition: ease all 0.3s;
//   opacity: 0.9;
//   z-index: 1;
// }
// :deep(.slick-arrow.custom-slick-arrow:before) {
//   display: none;
// }
// :deep(.slick-arrow.custom-slick-arrow:hover) {
//   color: #fff;
//   opacity: 0.5;
// }
</style>
