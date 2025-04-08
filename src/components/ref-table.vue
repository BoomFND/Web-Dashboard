<script lang="ts" setup>
import { useNumberFormat } from '@/hooks/useNumberFormat'
interface Columns {
  title: string
  dataIndex: string
  width?: string
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
</script>

<template>
  <boom-table class="rank-table" :columns="props.columns" :data="props.data">
    <template #ranking="{ ranking, rankingRise }">
      <div class="rank-col">
        <div class="ranking">{{ ranking }}</div>
        <div class="rank-rise" :class="rankingRise > 0 ? 'green' : 'red'" v-if="rankingRise !== 0">
          <svg-icon :name="`${rankingRise > 0 ? 'arrow-up' : 'arrow-down'}`"></svg-icon>
          {{ Math.abs(rankingRise) }}
        </div>
      </div>
    </template>

    <template #name="{ name, avatar }">
      <div class="username">
        <boom-avatar :src="avatar" :username="name"></boom-avatar>
        <div class="name-wrapper">
          <div class="name">{{ name }}</div>
        </div>
      </div>
    </template>

    <template #points="{ points }">
      <div class="points-col">
        <div class="points">{{ formatNumber(points) }}</div>
        <svg-icon name="home-points"></svg-icon>
      </div>
    </template>

    <template #avgSpend="{ avgSpend }">
      <div class="points-col">
        <div class="points">{{ formatNumber(avgSpend) }}s</div>
      </div>
    </template>
  </boom-table>
</template>

<style lang="scss" scoped>
.rank-table {
  min-width: 587px;

  :deep(.th-item:nth-child(2)) {
    min-width: 180px;
  }
  .rank-col,
  .points-col {
    display: flex;
    align-items: center;
  }
  .rank-col {
    .ranking {
      min-width: 25px;
      color: #fff;
      font-size: 24px;
      font-weight: 700;
      line-height: 120%; /* 28.8px */
      text-transform: lowercase;
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

  .username {
    display: flex;
    align-items: center;
    min-width: 180px;
    // flex: 2;

    .name-wrapper {
      margin-left: 12px;

      .wallet {
        margin-top: 4px;
        font-weight: normal;
      }
    }
  }

  .points-col .svg-icon {
    margin-left: 4px;
    width: 18px;
    height: 18px;
  }
}
</style>
