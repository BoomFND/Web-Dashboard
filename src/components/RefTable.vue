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
        <div class="name-wrapper">
          <div class="name">{{ name }}</div>
        </div>
      </div>
    </template>

    <template #points="{ points }">
      <div class="points">{{ formatNumber(points) }}</div>
      <svg-icon v-if="!!points" name="dashboard-score"></svg-icon>
    </template>

    <template #avgSpend="{ avgSpend }">
      <div class="points-col">
        <div class="points">{{ formatNumber(avgSpend) }}s</div>
      </div>
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
  min-width: 587px;
  min-height: 700px;

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

  .username {
    display: flex;
    align-items: center;
    min-width: 180px;

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

  .points {
    color: #1d1d1f;
    text-align: right;
    font-family: Urbanist;
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
