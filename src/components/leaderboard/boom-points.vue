<script lang="ts" setup>
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'
import { useNumberFormat } from '@/hooks/useNumberFormat'

const pointsStore = usePointsStore()
const userStore = useUserStore()
const { formatNumber } = useNumberFormat()
</script>

<template>
  <div class="points-wrapper">
    <div class="left">
      <div class="current-season">
        <div class="label">
          <svg-icon name="header-logo" />
          <span>Current Season</span>
        </div>
        <div class="value">
          {{ userStore.accessToken ? formatNumber(pointsStore.myGameInfo.points) : '--' }}
        </div>
      </div>
    </div>
    <div class="right">
      <svg-icon name="dashboard-score" />
      <div class="">
        <div class="label">Total Rewards</div>
        <div class="value">
          {{ userStore.accessToken ? formatNumber(pointsStore.myGameInfo.totalPoints) : '--' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.points-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;

  .left {
    display: flex;

    .current-season {
      display: flex;
      align-items: flex-end;
      height: 22px;

      .label {
        display: flex;
        height: 22px;
        padding: 2px 8px;
        justify-content: center;
        align-items: center;
        gap: 4px;
        border-radius: 6px 0px 0px 6px;
        background: #1d1d1f;
        flex-shrink: 0;

        .svg-icon {
          width: 14px;
          height: 14px;
        }

        span {
          display: flex;
          align-items: center;
          color: #fff;
          font-feature-settings:
            'ss01' on,
            'cv01' on,
            'cv11' on;
          font-family: Urbanist;
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: 130%;
        }
      }

      .value {
        display: flex;
        height: 22px;
        padding: 0px 8px;
        justify-content: center;
        align-items: center;
        gap: 8px;
        border-radius: 0px 6px 6px 0px;
        border: 1px solid #1d1d1f;
        color: #1d1d1f;
        font-feature-settings:
          'ss01' on,
          'cv01' on,
          'cv11' on;
        font-family: Urbanist;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 130%;
      }
    }
  }

  .right {
    display: flex;
    padding: 6px 12px;
    align-items: center;
    align-self: stretch;
    gap: 8px;
    border-radius: 12px;
    background: #fff;

    .svg-icon {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .label {
      color: #1d1d1f;
      font-feature-settings:
        'ss01' on,
        'cv01' on,
        'cv11' on;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 130%;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      :deep(.svg-icon) {
        margin-left: 2px;
        width: 14px;
        height: 14px;
      }
    }

    .value {
      color: #1d1d1f;
      font-feature-settings:
        'ss01' on,
        'cv01' on,
        'cv11' on;
      font-family: Urbanist;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: 130%;
    }
  }
}

@media (min-width: 1921px) {
  .points-wrapper {
    gap: calc(24 * 100vw / 1920);

    .left {
      .current-season {
        height: calc(22 * 100vw / 1920);

        .label {
          height: calc(22 * 100vw / 1920);
          padding: calc(2 * 100vw / 1920) calc(8 * 100vw / 1920);
          gap: calc(4 * 100vw / 1920);
          border-radius: calc(6 * 100vw / 1920) 0 0 calc(6 * 100vw / 1920);

          .svg-icon {
            width: calc(14 * 100vw / 1920);
            height: calc(14 * 100vw / 1920);
          }

          span {
            font-size: calc(12 * 100vw / 1920);
          }
        }

        .value {
          height: calc(22 * 100vw / 1920);
          padding: 0 calc(8 * 100vw / 1920);
          gap: calc(8 * 100vw / 1920);
          border-radius: 0 calc(6 * 100vw / 1920) calc(6 * 100vw / 1920) 0;
          font-size: calc(14 * 100vw / 1920);
        }
      }
    }

    .right {
      padding: calc(6 * 100vw / 1920) calc(12 * 100vw / 1920);
      gap: calc(8 * 100vw / 1920);
      border-radius: calc(12 * 100vw / 1920);

      .svg-icon {
        width: calc(32 * 100vw / 1920);
        height: calc(32 * 100vw / 1920);
      }

      .label {
        font-size: calc(14 * 100vw / 1920);

        :deep(.svg-icon) {
          margin-left: calc(2 * 100vw / 1920);
          width: calc(14 * 100vw / 1920);
          height: calc(14 * 100vw / 1920);
        }
      }

      .value {
        font-size: calc(18 * 100vw / 1920);
      }
    }
  }
}
</style>