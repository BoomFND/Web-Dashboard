<script lang="ts" setup>
import { usePointsStore } from '@/stores/points'
const pointsStore = usePointsStore()

import { useNumberFormat } from '@/hooks/useNumberFormat'

const { formatNumber } = useNumberFormat()
</script>

<template>
  <div class="earnings">
    <div class="title">
      Earnings
      <boom-tip title="ABOUT REFERRALS LEADERBOARD">
        <p>
          The referrals leaderboard ranks users based on the GPT earned by inviting friends during
          the current season.
        </p>
      </boom-tip>
    </div>
    <div class="content">
      <div class="season">
        <img src="@/assets/images/dashboard/earnings.png" alt="" />
        <div class="label">Season Earnings</div>
        <div class="value">
          {{
            `${formatNumber(pointsStore.myGameInfo.points.toFixed(2) ?? 0)} ${pointsStore.myGameInfo.unit}`
          }}
        </div>
      </div>
      <div class="today">
        <div class="value">
          {{
            `${formatNumber(pointsStore.myGameInfo.todayPoints ?? 0)} ${pointsStore.myGameInfo.unit}`
          }}
        </div>
        <div class="label">today’s Earnings</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.earnings {
  padding: 28px;

  .title {
    color: #fff;
    font-family: Urbanist;
    font-size: 32px;
    font-style: normal;
    font-weight: 800;
    line-height: 30px; /* 93.75% */
  }

  .content {
    display: flex;
    justify-content: space-between;

    .season {
      margin-top: 30px;
      flex-shrink: 0;

      img {
        width: 120px;
        height: 120px;
      }

      .label {
        margin-top: 10px;
        color: #fff;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px; /* 150% */
        opacity: 0.6;
      }

      .value {
        margin-top: 10px;
        color: #fff;
        font-family: Urbanist;
        font-size: 24px;
        font-style: normal;
        font-weight: 800;
        line-height: 30px; /* 125% */
      }
    }

    .today {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-width: 240px;
      height: 166.565px;
      flex-shrink: 0;
      border-radius: 16px;
      background: #0f1012;

      .value {
        text-align: center;
        font-family: Urbanist;
        font-size: 44px;
        font-style: normal;
        font-weight: 800;
        line-height: 40px; /* 90.909% */
        background: linear-gradient(180deg, #3fd9ff 0%, #0096ba 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .label {
        margin-top: 8px;
        color: #fff;
        text-align: center;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px; /* 150% */
        opacity: 0.6;
      }
    }
  }
}
</style>
