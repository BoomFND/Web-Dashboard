<script lang="ts" setup>
import { useRankingStore } from '@/stores/ranking'
import { usePointsStore } from '@/stores/points'
import { CaretDownOutlined } from '@ant-design/icons-vue'
import type { Season } from '@/types/models'
// import { useUserStore } from '@/stores/user'

const pointsStore = usePointsStore()
const rankingStore = useRankingStore()

const { getRankingList } = rankingStore

const selectedSeasonId = ref(-1)

watch(
  () => pointsStore.currentSeason,
  (newVal) => {
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
    align: 'left'
  },
  {
    title: 'gamer',
    dataIndex: 'name',
    align: 'left'
  },
  {
    title: 'GPT',
    dataIndex: 'points',
    align: 'right'
  }
])

const items = computed(() => {
  if (!pointsStore.seasons)
    return [
      {
        id: -1,
        name: 'TOTAL',
        startAt: '',
        endAt: '',
        default: false,
        display: false,
        highlight: false,
        order: 0,
        games: []
      }
    ]
  else
    return [
      {
        id: -1,
        name: 'TOTAL',
        startAt: '',
        endAt: '',
        default: false,
        display: false,
        highlight: false,
        live: false,
        order: 0,
        games: []
      },
      ...pointsStore.seasons
    ]
})

const handleChange = (value: any) => {
  if (value === -1) {
    // 排名数据
    return getRankingList(null, 1, 20)
  }
  const selectedSeason = pointsStore.seasons?.find((item) => item.id === value) as Season
  // pointsStore.setCurrentSeason(selectedSeason as Season)
  console.log(selectedSeason)
  return getRankingList(selectedSeason?.id, 1, 20)
}
</script>

<template>
  <div class="rank-view">
    <boom-points />
    <div class="leader-board">
      <div class="lb-header">
        <div class="lbh-left">
          <div class="title">
            Choose Season
            <boom-tip title="ABOUT LEADERBOARD">
              <p>
                The GPT leaderboard is a competition to see who can earn the most GPT during the
                season. Each season has
                <span class="primary-color">its own independent leaderboard</span>
                , where you can check the overall rankings or select a specific season to view its
                standings.
              </p>
            </boom-tip>
          </div>
          <div class="season">
            <a-select
              class="leadboard-select"
              v-model:value="selectedSeasonId"
              @change="handleChange"
            >
              <a-select-option v-for="item in items" :key="item.id" :value="item.id">
                <div class="item">{{ item.name }}</div>
                <div class="live" v-if="item.live">live</div>
              </a-select-option>
              <template #suffixIcon><CaretDownOutlined :style="{ color: '#f4dca5' }" /></template>
            </a-select>
          </div>
        </div>
        <div class="lbh-right">
          <!-- <boom-button-group
            v-model="checkedType"
            :options="buttonOptions"
            @change="handleChange"
          /> -->
        </div>
      </div>
      <div class="rank-wrapper">
        <boom-podium></boom-podium>
        <div class="table-wrapper">
          <rank-table :columns="columns" :data="rankingStore.data.results.slice(3)"></rank-table>
        </div>
      </div>
      <div class="load-more" @click="rankingStore.loadMore()">
        <template v-if="!rankingStore.data.isFinished && !rankingStore.data.isLoading">
          see more <svg-icon name="unfold"></svg-icon>
        </template>
        <template v-if="rankingStore.data.isLoading && rankingStore.data.page > 1">
          <a-spin />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rank-view {
  padding: 24px;
  border-radius: 32px;
  border: 2px solid rgba(39, 43, 64, 0.36);

  .leader-board {
    display: flex;
    margin-top: 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;

    .lb-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 46px;

      @media screen and (max-width: 768px) {
        height: 17px;
      }

      .lbh-left {
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 16.8px */
        text-transform: uppercase;

        .svg-icon {
          margin-left: 6px;
          width: 18px;
          height: 18px;
        }

        .season {
          margin-left: 10px;
        }
      }
    }

    .rank-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      gap: 16px;
      flex: 1;
    }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;

      &::-webkit-scrollbar {
        height: 4px;
      }
    }

    .load-more {
      display: flex;
      width: 100%;
      height: 24px;
      align-items: center;
      justify-content: center;

      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      font-weight: 700;
      line-height: 120%; /* 16.8px */
      text-transform: lowercase;
      cursor: pointer;

      .svg-icon {
        width: 24px;
        height: 24px;
        color: #fff;
      }
    }
  }

  :deep(.rank-table) {
    border-radius: 32px;
    overflow: hidden;

    .table-header {
      height: 54px;
      background: #191a27;
    }

    .th-item,
    .tb-row {
      display: flex;
      align-items: center;
    }

    .th-item {
      padding: 10px 20px;
      justify-content: center;

      &:first-child {
        justify-content: flex-start;
      }

      &:nth-child(2) {
        justify-content: flex-start;
        padding-left: 0px;
      }

      &:last-child {
        justify-content: flex-end;
      }
    }

    .tb-row {
      margin-top: 2px;
      height: 64px;
      background: #191a27;

      &.highlight {
        color: #f4dca5;

        .ranking,
        .points {
          color: #f4dca5;
        }
      }

      &:nth-child(1) {
        background-image: url('@/assets/images/rank/4.png');
        background-position: center;
        background-size: cover;
      }
      &:nth-child(2) {
        background-image: url('@/assets/images/rank/5.png');
        background-position: center;
        background-size: cover;
      }
      &:nth-child(3) {
        background-image: url('@/assets/images/rank/6.png');
        background-position: center;
        background-size: cover;
      }
      &:nth-child(4) {
        background-image: url('@/assets/images/rank/7.png');
        background-position: center;
        background-size: cover;
      }
      &:nth-child(5) {
        background-image: url('@/assets/images/rank/8.png');
        background-position: center;
        background-size: cover;
      }
      &:nth-child(6) {
        background-image: url('@/assets/images/rank/9.png');
        background-position: center;
        background-size: cover;
      }
      &:nth-child(7) {
        background-image: url('@/assets/images/rank/10.png');
        background-position: center;
        background-size: cover;
      }
    }

    .tb-col .ranking {
      min-width: 35px;
    }
  }
}

.board-tip {
  padding-left: 10px;

  li::marker {
    color: #f4dca5;
  }

  span {
    color: #f4dca5;
  }
}
</style>
<style lang="scss">
.ant-select {
  width: 320px;
  @media screen and (max-width: 600px) {
    width: calc(100% + 45px);
    // display: none;
  }
  @media screen and (max-width: 458px) {
    width: 100%;
  }
  &:not(.ant-select-customize-input) {
    .ant-select-selector {
      border-radius: 24px;
      border: 1px solid #f4dca5;
      background: #191a28;

      .ant-select-selection-item {
        color: #f4dca5;
      }
    }

    &:not(.ant-select-disabled):not(.ant-pagination-size-changer):hover .ant-select-selector {
      border-color: #f4dca5;
    }
  }
}

.ant-select-dropdown {
  background: #191a27;
  box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);

  .ant-select-item-option {
    &-content {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(#f4dca5, 0.5);

      .item {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .live {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 12px;
        flex-shrink: 0;
        border-radius: 2px;
        background: #00ffb4;
        font-size: 12px;
        color: #0f1017;
        text-align: center;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .hot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 12px;
        flex-shrink: 0;
        border-radius: 2px;
        background: #ff5487;
        font-size: 12px;
        color: #0f1017;
        text-align: center;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
      }
    }

    &-active:not(.ant-select-item-option-disabled) {
      background-color: transparent;
      .ant-select-item-option-content {
        color: rgba(#f4dca5, 0.7);
      }
    }

    &-selected:not(.ant-select-item-option-disabled) {
      background-color: transparent;
      .ant-select-item-option-content {
        color: #f4dca5;
      }
    }
  }
}

.ant-dropdown {
  .ant-dropdown-menu {
    .ant-dropdown-menu-item {
      padding: 16px 40px !important;

      .ant-dropdown-menu-title-content {
        color: var(--100, #fff);
        font-family: Quicksand;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 160%; /* 25.6px */
      }

      &.account-wrapper {
        .ant-dropdown-menu-title-content {
          display: flex;
          align-items: center;
          gap: 12px;
          align-self: stretch;
          flex: 1;

          .uid {
            color: #fff;
            font-family: Quicksand;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 160%; /* 25.6px */
          }

          .address {
            color: #00ffb4;
            font-family: Quicksand;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 160%;
          }
        }
      }
    }
  }
}
</style>
