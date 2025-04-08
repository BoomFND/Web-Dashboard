<script lang="ts" setup>
import { gsap } from 'gsap'
import { useRankingStore } from '@/stores/ranking'
import { usePointsStore } from '@/stores/points'
import { computed, onMounted, ref, watch } from 'vue'

const pointsStore = usePointsStore()
const rankingStore = useRankingStore()

const { getRankingList } = rankingStore

const selectedSeasonId = ref(-1)

watch(
  () => pointsStore.currentSeason,
  (newVal) => {
    if (!newVal) return
    selectedSeasonId.value = newVal.id
    // 排名数据
    getRankingList(selectedSeasonId.value, 1, 20)
  },
  { deep: true, immediate: true }
)

// 排名表格表头
const columns = computed(() => [
  {
    title: 'Rank',
    dataIndex: 'ranking',
    align: 'left' as const,
    width: '80px'
  },
  {
    title: 'Gamer',
    dataIndex: 'name',
    align: 'left' as const,
    width: '200px'
  },
  {
    title: 'Address',
    dataIndex: 'walletAddress',
    align: 'center' as const,
    width: '200px'
  },
  {
    title: 'GPT',
    dataIndex: 'points',
    align: 'right' as const,
    width: '100px'
  }
])

const handleAnimation = () => {
  gsap.from('.leaderboard-view .title', {
    opacity: 0,
    y: 24,
    duration: 0.5,
    stagger: 0.1,
    ease: 'circ.out',
    delay: 0.8
  })
}

onMounted(async () => {
  handleAnimation()
})
</script>

<template>
  <section class="leaderboard-view">
    <div class="title">Current Season Leaderboard</div>
    <BoomPodium />
    <div class="ranking-view">
      <RankTable :columns="columns" :data="rankingStore.data.results">
        <template #footer>
          <div v-if="!rankingStore.data.isFinished" class="load-more" @click="rankingStore.loadMore()">
            <template v-if="!rankingStore.data.isFinished && !rankingStore.data.isLoading">
              see more
            </template>
            <template v-if="rankingStore.data.isLoading && rankingStore.data.page > 1">
              <a-spin />
            </template>
          </div>
        </template>
        <template #empty v-if="rankingStore.data.results.length === 0">
          <div class="empty-wrapper">
            <Empty />
          </div>
        </template>
      </RankTable>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.leaderboard-view {
  display: flex;
  width: 100%;
  padding: 16px 28px 56px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;

  .title {
    color: var(--color-primary);
    font-size: 32px;
    font-weight: 800;
    line-height: 125%;
    letter-spacing: -0.076px;
  }

  .ranking-view {
    width: 100%;

    .empty-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
    }
  }
}

@media screen and (min-width: 1921px) {
  .leaderboard-view {
    padding: calc(16 * 100vw / 1920) calc(28 * 100vw / 1920) calc(56 * 100vw / 1920);
    gap: calc(24 * 100vw / 1920);

    .title {
      font-size: calc(32 * 100vw / 1920);
    }
  }
}

@media screen and (max-width: 834px) {
  .leaderboard-view {
    padding: 16px clamp(16px, calc(28px - 12 / 459 * (834px - 100vw)), 28px);

    .title {
      font-size: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);
    }
  }
}
</style>
