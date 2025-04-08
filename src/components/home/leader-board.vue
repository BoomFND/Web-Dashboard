<script lang="ts" setup>
import { useRankingStore } from '@/stores/ranking'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const rankingStore = useRankingStore()
const { getRankingList } = rankingStore

const checkedType = ref<'SPEED' | 'POINTS'>('POINTS')
// const buttonOptions = ref([
//   {
//     label: 'GPT',
//     value: 'POINTS'
//   },
//   {
//     label: 'Timed Run',
//     value: 'SPEED'
//   }
// ])

// 排名表格表头
const columns = computed(() => [
  {
    title: 'Rank',
    dataIndex: 'ranking',
    width: '130px'
  },
  {
    title: 'gamer',
    dataIndex: 'name'
  },
  {
    title: checkedType.value === 'SPEED' ? 'Timed Run (S)' : 'GPT',
    dataIndex: checkedType.value === 'SPEED' ? 'avgSpend' : 'points',
    width: '100px'
  }
])

// 排名数据
getRankingList(null, 1, 15)

// 监听用户登录，登录后，要请求排名列表
watch(
  () => userStore.accessToken,
  (newV) => {
    if (newV) {
      getRankingList(null, 1, 15)
    }
  }
)
</script>

<template>
  <div class="leader-board">
    <div class="lb-header">
      <div class="lbh-left">
        Week6
        <boom-tip title="ABOUT REFERRALS LEADERBOARD">
          <p>
            The referrals leaderboard ranks users based on the GPT earned by inviting friends during
            the current season.
          </p>
        </boom-tip>
      </div>
      <div class="lbh-right">
        <!-- <boom-button-group v-model="checkedType" :options="buttonOptions" @change="handleChange" /> -->
      </div>
    </div>
    <template v-if="userStore.accessToken">
      <boom-podium></boom-podium>
      <div class="rank-wrapper">
        <div class="rw-left">
          <rank-table :columns="columns" :data="rankingStore.data.results.slice(3, 9)"></rank-table>
        </div>
        <div class="rw-right">
          <rank-table :columns="columns" :data="rankingStore.data.results.slice(9)"></rank-table>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="rank-wrapper" style="margin-top: 24px">
        <div class="rw-left">
          <rank-table :columns="columns" :data="rankingStore.data.results.slice(0, 5)"></rank-table>
        </div>
        <div class="rw-right">
          <rank-table
            :columns="columns"
            :data="rankingStore.data.results.slice(5, 10)"
          ></rank-table>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.leader-board {
  display: flex;
  width: 100%;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 32px;
  border: 2px solid rgba(39, 43, 64, 0.36);

  .lb-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 46px;

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
    }
  }

  .rank-wrapper {
    display: flex;
    width: 100%;
    gap: 16px;

    .rw-left,
    .rw-right {
      padding: 24px;

      flex: 1;
      border-radius: 32px;
      border: 0px solid rgba(39, 43, 64, 0.18);
      background: rgba(20, 21, 31, 0.65);
      box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);
      backdrop-filter: blur(20px);
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
