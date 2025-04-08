<script lang="ts" setup>
import { gsap } from 'gsap'
import { useRankingStore } from '@/stores/ranking'
import { useNumberFormat } from '@/hooks/useNumberFormat'
import SvgIcon from './commons/SvgIcon.vue'
const { formatNumber } = useNumberFormat()
const rankingStore = useRankingStore()

const handleAnimation = () => {
  gsap
    .timeline()
    .from('.leaderboard-view .podium .item:nth-child(2)', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.1,
      ease: 'circ.out',
      delay: 0.8
    })
    .from(
      '.leaderboard-view .podium .item:nth-child(1)',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'circ.out'
      },
      '-=0.1'
    )
    .from(
      '.leaderboard-view .podium .item:nth-child(3)',
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
onMounted(async () => {
  handleAnimation()
})
</script>

<template>
  <div class="podium">
    <div class="item">
      <template v-if="rankingStore.data.isLoading">
        <a-skeleton-button active />
        <a-skeleton-avatar class="avatar" active :size="40" />
        <div class="name-wrapper">
          <a-skeleton-input active />
          <a-skeleton-button active />
        </div>
        <div class="score">
          <a-skeleton-button active />
          <a-skeleton-button active />
        </div>
      </template>
      <template v-else>
        <SvgIcon class="index" name="leaderboard-2" />
        <boom-avatar
          :size="40"
          :src="rankingStore.data.results[1]?.avatar"
          :username="rankingStore.data.results[1]?.name"
        />
        <div class="name-wrapper">
          <div class="name">{{ rankingStore.data.results[1]?.name }}</div>
          <div class="wallet">{{ rankingStore.data.results[1]?.walletAddress || '--' }}</div>
        </div>

        <div class="score">
          <div class="speed">
            {{
              `${formatNumber(rankingStore.data.results[1]?.avgSpend)}${rankingStore.data.results[1]?.avgSpend > 0 ? 's' : ''}`
            }}
          </div>
          <div class="gpt">
            <div class="text">{{ formatNumber(rankingStore.data.results[1]?.points) }}</div>
            <SvgIcon v-if="rankingStore.data.results[1]?.points" name="dashboard-score" />
          </div>
        </div>
      </template>
    </div>
    <div class="item">
      <template v-if="rankingStore.data.isLoading">
        <a-skeleton-button active />
        <a-skeleton-avatar class="avatar" active :size="64" />
        <div class="name-wrapper">
          <a-skeleton-input active />
          <a-skeleton-button active />
        </div>
        <div class="score">
          <a-skeleton-button active />
          <a-skeleton-button active />
        </div>
      </template>
      <template v-else>
        <SvgIcon class="index" name="leaderboard-1" />
        <boom-avatar
          :size="64"
          :src="rankingStore.data.results[0]?.avatar"
          :username="rankingStore.data.results[0]?.name"
        ></boom-avatar>
        <div class="name-wrapper">
          <div class="name">{{ rankingStore.data.results[0]?.name }}</div>
          <div class="wallet">{{ rankingStore.data.results[0]?.walletAddress || '--' }}</div>
        </div>
        <div class="score">
          <div class="speed">
            {{
              `${formatNumber(rankingStore.data.results[1]?.avgSpend)}${rankingStore.data.results[1]?.avgSpend > 0 ? 's' : ''}`
            }}
          </div>
          <div class="gpt">
            <div class="text">{{ formatNumber(rankingStore.data.results[0]?.points) }}</div>
            <SvgIcon v-if="rankingStore.data.results[0]?.points" name="dashboard-score" />
          </div>
        </div>
      </template>
    </div>
    <div class="item">
      <template v-if="rankingStore.data.isLoading">
        <a-skeleton-button active />
        <a-skeleton-avatar class="avatar" active :size="40" />
        <div class="name-wrapper">
          <a-skeleton-input active />
          <a-skeleton-button active />
        </div>
        <div class="score">
          <a-skeleton-button active />
          <a-skeleton-button active />
        </div>
      </template>
      <template v-else>
        <SvgIcon class="index" name="leaderboard-3" />
        <boom-avatar
          :size="40"
          :src="rankingStore.data.results[2]?.avatar"
          :username="rankingStore.data.results[2]?.name"
        ></boom-avatar>
        <div class="name-wrapper">
          <div class="name">{{ rankingStore.data.results[2]?.name }}</div>
          <div class="wallet">{{ rankingStore.data.results[2]?.walletAddress || '--' }}</div>
        </div>
        <div class="score">
          <div class="speed">
            {{
              `${formatNumber(rankingStore.data.results[2]?.avgSpend)}${rankingStore.data.results[2]?.avgSpend > 0 ? 's' : ''}`
            }}
          </div>
          <div class="gpt">
            <div class="text">{{ formatNumber(rankingStore.data.results[2]?.points) }}</div>
            <SvgIcon v-if="rankingStore.data.results[2]?.points" name="dashboard-score" />
          </div>
        </div>
      </template>
    </div>
  </div>
  <div class="w-podium">
    <div class="item">
      <SvgIcon class="index" name="leaderboard-1" />
      <boom-avatar
        :size="64"
        :src="rankingStore.data.results[0]?.avatar"
        :username="rankingStore.data.results[0]?.name"
      ></boom-avatar>
      <div class="name-wrapper">
        <div class="name">{{ rankingStore.data.results[0]?.name }}</div>
        <div class="wallet">{{ rankingStore.data.results[0]?.walletAddress || '--' }}</div>
      </div>
      <div class="score">
        <div class="speed">
          {{
            `${formatNumber(rankingStore.data.results[1]?.avgSpend)}${rankingStore.data.results[1]?.avgSpend > 0 ? 's' : ''}`
          }}
        </div>
        <div class="gpt">
          <div class="text">{{ formatNumber(rankingStore.data.results[0]?.points) }}</div>
          <SvgIcon v-if="rankingStore.data.results[0]?.points" name="dashboard-score" />
        </div>
      </div>
    </div>
    <div class="item">
      <SvgIcon class="index" name="leaderboard-2" />
      <boom-avatar
        :size="40"
        :src="rankingStore.data.results[1]?.avatar"
        :username="rankingStore.data.results[1]?.name"
      />
      <div class="name-wrapper">
        <div class="name">{{ rankingStore.data.results[1]?.name }}</div>
        <div class="wallet">{{ rankingStore.data.results[1]?.walletAddress || '--' }}</div>
      </div>

      <div class="score">
        <div class="speed">
          {{
            `${formatNumber(rankingStore.data.results[1]?.avgSpend)}${rankingStore.data.results[1]?.avgSpend > 0 ? 's' : ''}`
          }}
        </div>
        <div class="gpt">
          <div class="text">{{ formatNumber(rankingStore.data.results[1]?.points) }}</div>
          <SvgIcon v-if="rankingStore.data.results[1]?.points" name="dashboard-score" />
        </div>
      </div>
    </div>
    <div class="item">
      <SvgIcon class="index" name="leaderboard-3" />
      <boom-avatar
        :size="40"
        :src="rankingStore.data.results[2]?.avatar"
        :username="rankingStore.data.results[2]?.name"
      ></boom-avatar>
      <div class="name-wrapper">
        <div class="name">{{ rankingStore.data.results[2]?.name }}</div>
        <div class="wallet">{{ rankingStore.data.results[2]?.walletAddress || '--' }}</div>
      </div>
      <div class="score">
        <div class="speed">
          {{
            `${formatNumber(rankingStore.data.results[2]?.avgSpend)}${rankingStore.data.results[2]?.avgSpend > 0 ? 's' : ''}`
          }}
        </div>
        <div class="gpt">
          <div class="text">{{ formatNumber(rankingStore.data.results[2]?.points) }}</div>
          <SvgIcon v-if="rankingStore.data.results[2]?.points" name="dashboard-score" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.podium {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  align-self: stretch;
}

.item {
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
  border-radius: 16px;
  background: #fff;

  .index {
    width: 46.97px;
    height: 64px;
    flex-shrink: 0;
  }

  &:not(:nth-child(2)) .index {
    width: 29.356px;
    height: 40px;
  }

  .name-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: var(--color-primary);
    text-align: center;
    font-family: Urbanist;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 150%;

    .name {
      font-size: 24px;
      font-weight: 800;
      line-height: 133.333%;
      letter-spacing: 0.196px;
    }

    .wallet {
      text-align: center;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .score {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;

    .speed {
      color: #86868b;
      font-family: Urbanist;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px; /* 166.667% */
    }
  }

  .gpt {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 125%;

    .svg-icon {
      width: 16px;
      height: 16px;
    }
  }
}

.w-podium {
  display: none;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;

  .item {
    width: 100%;
  }
}

@media screen and (min-width: 1921px) {
  .podium {
    gap: calc(24 * 100vw / 1920);
  }

  .item {
    padding: calc(16 * 100vw / 1920) calc(24 * 100vw / 1920);
    gap: calc(24 * 100vw / 1920);
    border-radius: calc(16 * 100vw / 1920);

    .index {
      width: calc(46.97 * 100vw / 1920);
      height: calc(64 * 100vw / 1920);
    }

    &:not(:nth-child(2)) .index {
      width: calc(29.356 * 100vw / 1920);
      height: calc(40 * 100vw / 1920);
    }

    .name-wrapper {
      font-size: calc(16 * 100vw / 1920);

      .name {
        font-size: calc(24 * 100vw / 1920);
      }

      .wallet {
        font-size: calc(16 * 100vw / 1920);
      }
    }

    .score {
      .speed {
        font-size: calc(12 * 100vw / 1920);
        line-height: calc(20 * 100vw / 1920);
      }
    }

    .gpt {
      gap: 4px;
      font-size: calc(16 * 100vw / 1920);

      .svg-icon {
        width: calc(16 * 100vw / 1920);
        height: calc(16 * 100vw / 1920);
      }
    }
  }
}

@media screen and (max-width: 834px) {
  .podium {
    display: none;
  }

  .w-podium {
    display: flex;
  }
}
</style>
