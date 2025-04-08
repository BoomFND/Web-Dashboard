<script lang="ts" setup>
import dayjs from 'dayjs'
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'

dayjs.locale('en')

const pointsStore = usePointsStore()
const userStore = useUserStore()

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => userStore.accessToken,
  (newV) => {
    if (newV) {
      pointsStore.fetchHistoryPoints()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="reward-panel">
    <div class="header">Rewards</div>
    <div class="content">
      <div class="content-wrapper">
        <div class="content__header">
          <div class="content__header-th">Season</div>
          <div class="content__header-th">Start/End Date</div>
<!--          <div class="content__header-th">Total Refferals</div>-->
          <div class="content__header-th">Total Rewards</div>
        </div>
        <div class="content__body">
          <div class="empty" v-if="!pointsStore.historyPoints.length">No Data</div>
          <div class="content__body-row" v-for="item in pointsStore.historyPoints" :key="item.id">
            <div class="content__body-td">{{ item.name }}</div>
            <div class="content__body-td">
              <div>{{ dayjs(item.startAt).format('MMM DD,YYYY HH:mm:ss A') }}</div>
              <div>{{ dayjs(item.endAt).format('MMM DD,YYYY HH:mm:ss A') }}</div>
            </div>
<!--            <div class="content__body-td">{{ item.totalRefferals }}</div>-->
            <div class="content__body-td">
              <boom-number
                symbol=""
                :number="item.seasonPoints ?? '--'"
                unit="GPT"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reward-panel {
  display: flex;
  flex-direction: column;
  color: var(--60, rgba(255, 255, 255, 0.6));
  font-family: Quicksand;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;

  .header {
    margin-top: 36px;
    padding-left: 24px;
    color: var(--100, #fff);
    font-family: Quicksand;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .content {
    margin-top: 16px;
    display: flex;
    padding: 24px;
    flex-direction: column;
    align-items: flex-start;
    // gap: 25px;
    align-self: stretch;
    border-radius: 32px;
    background: #191a27;
    width: 100%;
    overflow-x: auto;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &-wrapper {
      width: 100%;
      min-width: 625px;
    }

    &__header {
      display: flex;
      justify-content: space-around;
      width: 100%;
      padding: 24px 0;
      border-top: 1px solid rgba(39, 43, 64, 0.36);
      border-bottom: 1px solid rgba(39, 43, 64, 0.36);

      &-th {
        padding-left: 30px;
        flex: 1;
        text-align: center;

        &:first-child {
          text-align: left;
        }
        &:nth-child(2) {
          min-width: 217px;
        }

        &:last-child {
          padding-right: 30px;
          text-align: right;
        }
      }
    }

    .content__body {
      width: 100%;
      color: var(--60, rgba(255, 255, 255, 0.8));

      &-row {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 24px 0;
        border-bottom: 1px solid rgba(39, 43, 64, 0.36);
      }

      &-td {
        padding-left: 30px;
        flex: 1;
        text-align: center;

        &:first-child {
          text-align: left;
        }

        &:nth-child(2) {
          min-width: 217px;
        }

        &:last-child {
          padding-right: 30px;
          text-align: right;
          color: #70f1b4;
        }

        :deep(.boom-number) {
          .unit,
          .number {
            font-size: 16px;
          }
        }
      }
    }

    .empty {
      text-align: center;
      padding: 24px;
    }
  }
}
</style>
