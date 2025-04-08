<script lang="ts" setup>
import { gsap } from 'gsap'
import { useRankingStore } from '@/stores/ranking'
import { useNumberFormat } from '@/hooks/useNumberFormat'
import SvgIcon from './commons/SvgIcon.vue'

interface Columns {
  title: string
  dataIndex: string
  width?: string
  align?: 'left' | 'right' | 'center'
}

interface Data {
  [key: string]: any
}

interface Props {
  columns: Array<Columns>
  data: Array<Data>
}

const props = defineProps<Props>()

// 数字格式化
const { formatNumber } = useNumberFormat()

const tl = gsap.timeline()
const handleAnimation = () => {
  tl.from('.leaderboard-view .rank-table', {
    opacity: 0,
    y: 24,
    duration: 0.5,
    stagger: 0.1,
    ease: 'circ.out'
  }).from(
    '.leaderboard-view .rank-table .table-header',
    {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'circ.out',
      delay: 2.21
    },
    '-=0.1'
  )
}

const dataAnimation = () => {
  tl.from(
    '.leaderboard-view .rank-table .tb-row',
    {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.1,
      ease: 'circ.out'
    },
    '-=0.1'
  ).from(
    '.leaderboard-view .rank-table .table-footer',
    {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.1,
      ease: 'circ.out'
    },
    '-=0.1'
  )
}

const rankingStore = useRankingStore()
watch(
  () => props.data.length,
  async (newV) => {
    await nextTick()
    if (props.data.length === rankingStore.data.size) dataAnimation()
    if (newV > rankingStore.data.size) {
      await nextTick()
      const rowItems = document.querySelectorAll('.rank-table .table-body .tb-row')

      const doms = Array.from(rowItems).slice(
        rankingStore.data.size * (rankingStore.data.page - 1),
        -1
      )

      tl.from(doms, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'circ.out'
      })
    }
  }
)

onMounted(async () => {
  handleAnimation()
})
</script>

<template>
  <BoomTable class="rank-table" :columns="props.columns" :data="props.data">
    <template #ranking="{ ranking }">
      <div class="rank-col">
        <div class="ranking">
          <SvgIcon v-if="ranking < 4" :name="`leaderboard-r-${ranking}`" />
          <span class="index" v-else>{{ ranking }}</span>
        </div>
      </div>
    </template>

    <template #name="{ name, avatar }">
      <div class="username">
        <boom-avatar :src="avatar" :username="name"></boom-avatar>
        <div class="name">{{ name }}</div>
      </div>
    </template>
    <template #address="{ walletAddress }">
      <div class="username">
        <div class="wallet">{{ walletAddress || '--' }}</div>
      </div>
    </template>

    <template #points="{ points }">
      <div class="points">{{ formatNumber(points) }}</div>
      <svg-icon name="dashboard-score"></svg-icon>
    </template>
    <template #footer>
      <slot name="footer"></slot>
    </template>
    <template #empty>
      <slot name="empty"></slot>
    </template>
  </BoomTable>
</template>

<style lang="scss" scoped>
.rank-table {
  display: flex;
  padding: 0px 24px 24px 24px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 16px;
  background: #fff;
  min-width: 400px;
  min-height: 700px;

  :deep(.table-header) {
    display: flex;
    padding: 24px 0px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    color: #6e6e73;
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px; /* 142.857% */
    text-transform: capitalize;
    border-bottom: 1px solid rgba(210, 210, 215, 0.4);
  }

  .rank-col {
    display: flex;
    align-items: center;
  }
  .rank-col {
    .ranking {
      width: 80px;
      height: 22px;
      color: #000;
      font-family: Urbanist;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px; /* 125% */

      .svg-icon {
        margin-left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      .index {
        display: flex;
        align-items: center;
        padding: 1px 66.743px 1px 4.257px;
      }
    }

    .rank-rise {
      margin-left: 10px;
      display: flex;
      align-items: center;

      font-size: 14px;
      font-weight: 700;
      line-height: 120%; /* 16.8px */

      .svg-icon {
        width: 12px;
        height: 12px;
      }

      &.red {
        color: #ff1313;
      }

      &.green {
        color: #70f1b4;
      }
    }
  }

  :deep(.tb-row) {
    margin-top: 0;
    height: 72px;
    display: flex;
    padding: 24px 0px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    border-bottom: 1px solid rgba(210, 210, 215, 0.4);
    color: var(--color-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 24px; /* 150% */
    text-transform: none;
  }

  .username {
    display: flex;
    align-items: center;
    gap: 8px;
    // flex: 2;

    .name-wrapper {
      margin-left: 12px;

      .wallet {
        margin-top: 4px;
        font-weight: normal;
      }
    }
  }

  :deep(.tb-col) {
    display: flex;
    align-items: center;
  }

  .points {
    color: var(--color-primary);
    text-align: right;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px; /* 150% */
  }
  .svg-icon {
    margin-left: 4px;
    width: 18px;
    height: 18px;
  }
}
</style>
