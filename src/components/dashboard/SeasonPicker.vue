<script lang="ts" setup>
import type { Season } from '@/types/models'
import { useUserStore } from '@/stores/user'
import { usePointsStore } from '@/stores/points'

const pointsStore = usePointsStore()
const userStore = useUserStore()

const currentSeason = ref()

watch(
  () => pointsStore.currentSeason,
  (newVal) => {
    currentSeason.value = newVal.id
  },
  { deep: true }
)

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => [userStore.accessToken, pointsStore.currentSeason],
  (newV) => {
    if (newV) {
      pointsStore.getGamePoints()
    }
  },
  { immediate: true }
)

const handleSelect = (value: any) => {
  const selectedSeason = pointsStore.seasons?.find((item) => item.id === value)

  pointsStore.setCurrentSeason(selectedSeason as Season)
}

Promise.all([pointsStore.fetchSeasons(), pointsStore.getCurrentSeason()])
</script>

<template>
  <div class="season-picker">
    <div
      class="item"
      :class="{ active: season.id === currentSeason }"
      v-for="season in pointsStore.seasons"
      :key="season.id"
      @click="handleSelect(season.id)"
    >
      <img src="@/assets/images/dashboard/doge.png" alt="" />
      <div class="text">{{ season.name }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.season-picker {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  height: 96px;
  gap: 28px;

  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 199px;
    height: 96px;
    flex-shrink: 0;
    cursor: pointer;
    overflow: hidden;

    img {
      width: 40px;
      height: 40px;
      mix-blend-mode: luminosity;
      opacity: 0.5;
    }

    .text {
      color: #8d8d8d;
      font-family: Urbanist;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px; /* 125% */
      text-transform: capitalize;
    }

    &:hover {
      background: #0f1012;
      border-radius: 32px;
      border: 2px solid #1c1c1c;
      box-shadow: 0px 0px 8px 0px #1c1c1c;
    }

    &.active {
      color: #fff;
      border-radius: 32px;
      background: #1c1c1c;
      box-shadow: 0px 0px 24px 0px #1c1c1c;
      border: none;

      img {
        opacity: 1;
        mix-blend-mode: inherit;
      }
    }
  }
}
</style>
