<script lang="ts" setup>
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'
import type { GameType } from '@/types/models'

const pointsStore = usePointsStore()
const userStore = useUserStore()

// 游戏类型
const gameType = ref<GameType>(pointsStore.gameType)

// 切换游戏类型
const toggleGame = (type: GameType) => {
  gameType.value = type
  pointsStore.setGameType(type)

  // 重新请求数据
  userStore.accessToken && pointsStore.getGamePoints()
}

// 计算上次游戏时间
const lastPlayTime = computed(() => {
  const hours = pointsStore.myGameInfo.lastPlayed

  if (!hours) return '--'
  else if ((hours as number) > 30 * 24) return 'Last played a long time ago'
  else if ((hours as number) > 24)
    return `Last play <span style="color: #fff; opacity: 1;">${Math.floor((hours as number) / 24)}</span> days ago`
  else
    return `Last Played <span style="color: #fff; opacity: 1;">${Math.floor(hours as number)}</span> hours ago`
})

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => [userStore.accessToken, pointsStore.currentSeason],
  (newV) => {
    if (newV) {
      // pointsStore.getGamePoints()
      pointsStore.getMyAchievement()
    }
  },
  { immediate: true }
)

// // 立即请求面板数据
// pointsStore.fetchStatisticsData()

// // 设置定时任务，每隔5s请求一次接口，获取面板数据
// let timer: NodeJS.Timeout
// timer = setInterval(() => {
//   pointsStore.fetchStatisticsData()
// }, 10000)

// // 销毁组件时，取消定时器
// onUnmounted(() => {
//   if (timer) clearInterval(timer)
// })

const checkedType = ref('ingame')
const buttonOptions = ref([
  {
    label: 'ingame',
    value: 'ingame'
  },
  {
    label: 'Challenge card',
    value: 'card'
  }
])

const inGameList = computed(() => {
  const { simple, complex } = pointsStore.achievement || {}
  return [
    {
      icon: 'home-last-hits',
      label: 'last-hits',
      score:
        simple?.find((item: { eventType: string }) => item.eventType === 'last_hits')?.eventCount ??
        '--'
    },
    {
      icon: 'home-skill-damage',
      label: 'instances of skill damage',
      style: { width: '110px' },
      score:
        simple?.find((item: { eventType: string }) => item.eventType === 'hero_damage')
          ?.eventCount ?? '--'
    },
    {
      icon: 'home-champion-kills',
      label: 'Champion kills',
      style: { width: '90px' },
      score:
        simple?.find((item: { eventType: string }) => item.eventType === 'kills')?.eventCount ??
        '--'
    },
    {
      icon: 'home-enemy',
      label: 'Triple kills',
      score:
        simple?.find((item: { eventType: string }) => item.eventType === 'label_triple_kill')
          ?.eventCount ?? '--'
    },
    {
      icon: 'home-assists',
      label: 'Completed assists challenge',
      score:
        complex?.find((item: { eventType: string }) => item.eventType === 'assists')?.eventCount ??
        '--'
    },
    {
      icon: 'home-last-hit-challedge',
      label: 'Completed double kill challenge',
      score:
        complex?.find((item: { eventType: string }) => item.eventType === 'label_double_kill')
          ?.eventCount ?? '--'
    },
    {
      icon: 'home-betting-challedge',
      label: 'Completed betting challenge',
      score:
        complex?.find((item: { eventType: string }) => item.eventType === 'betting_tasks')
          ?.eventCount ?? '--'
    }
  ]
})

const cardList = computed(() => {
  const { system } = pointsStore.achievement || {}
  return [
    {
      icon: 'home-s',
      label: 'S.Card',
      score:
        system?.find((item: { eventType: string }) => item.eventType === 'S')?.eventCount ?? '--'
    },
    {
      icon: 'home-a',
      label: 'A.Card',
      score:
        system?.find((item: { eventType: string }) => item.eventType === 'A')?.eventCount ?? '--'
    },
    {
      icon: 'home-B',
      label: 'b.Card',
      score:
        system?.find((item: { eventType: string }) => item.eventType === 'B')?.eventCount ?? '--'
    },
    {
      icon: 'home-C',
      label: 'c.Card',
      score:
        system?.find((item: { eventType: string }) => item.eventType === 'C')?.eventCount ?? '--'
    }
  ]
})

const goToMarket = () => {
  window.open('https://element.market/collections/genesisboomernft', '_blank')
}
</script>

<template>
  <div class="points-wrapper">
    <boom-board>
      <div class="grid-item active" v-if="userStore.account.boomerHolder">
        <div class="grid-label">
          PASSCARD SBT
          <boom-tip title="ABOUT PASSCARD SBT">
            <p>
              This Passcard grants access to Bitlayer's gaming season, allowing participation in
              exclusive League of Legends Esports campaigns and eligibility for future airdrops.
            </p>
          </boom-tip>
        </div>
        <div class="grid-value">
          <SvgIcon name="quest-buff"></SvgIcon>
        </div>
      </div>
      <div class="grid-item" v-else>
        <div class="grid-label">
          PASSCARD SBT
          <boom-tip title="ABOUT PASSCARD SBT">
            <p>
              This Passcard grants access to Bitlayer's gaming season, allowing participation in
              exclusive League of Legends Esports campaigns and eligibility for future airdrops.
            </p>
          </boom-tip>
        </div>
        <div class="grid-value" @click="goToMarket">
          <SvgIcon name="quest-pre-buff"></SvgIcon>
        </div>
      </div>
    </boom-board>
    <div class="points-body">
      <div class="nav">
        <div class="left">
          <div
            class="icon icon-lol"
            :class="[`icon-${item.name.toLowerCase()}`, gameType === item.name ? 'active' : '']"
            v-for="item in pointsStore.currentSeason.games"
            :key="item.id"
            @click="toggleGame(item.name)"
          ></div>
        </div>
        <div class="right" v-html="lastPlayTime"></div>
      </div>
      <div class="card" :class="{ apex: gameType === 'APEX', lol: gameType === 'LOL' }">
        <div class="bg-wrapper">
          <boom-button-group v-model="checkedType" :options="buttonOptions">
            <template #ingame>
              Achievement
              <boom-tip title="About In-Game Challenges">
                <p>
                  In-game challenges are instant tasks activated upon launching the game with the
                  desktop app. They range from simple, one-off tasks to repeatable and betting
                  challenges, adding excitement to your gameplay. To earn Gamer Point rewards,
                  participation in <span class="primary-color">PVP game modes</span> is essential.
                </p>
                <p>
                  Note: Points from in-game challenges are scored individually per match and awarded
                  to Boomers upon completion.
                </p>
              </boom-tip>
            </template>
            <template #card>
              Challenge card
              <boom-tip title="About Challenge Card">
                Challenge cards, displayed on the desktop app, outline tasks with more extensive
                completion criteria, offering larger Gamer Point rewards. These cards are graded as
                S\A\B\C, with higher grades providing richer rewards. Each day, you have
                <span class="primary-color">six opportunities to refresh</span> and accept new
                challenge cards, allowing you to tackle tasks of greater difficulty and reward.
              </boom-tip>
            </template>
          </boom-button-group>
          <div v-if="checkedType === 'ingame'" class="ingame">
            <div class="left">
              <div class="grids">
                <div class="item" v-for="item in inGameList.slice(0, 4)" :key="item.icon">
                  <svg-icon :name="item.icon"></svg-icon>
                  <div class="label" :style="item.style">{{ item.label }}</div>
                  <div class="score"><boom-number symbol="×" :number="item.score" /></div>
                </div>
              </div>
              <div class="total">
                <boom-number
                  symbol="+"
                  :number="pointsStore.achievement?.simpleTotalPoints ?? '--'"
                  :unit="pointsStore.achievement?.unit"
                />
              </div>
            </div>
            <div class="right">
              <div class="grids">
                <div class="item" v-for="item in inGameList.slice(4)" :key="item.icon">
                  <svg-icon :name="item.icon"></svg-icon>
                  <div class="label">{{ item.label }}</div>
                  <div class="score"><boom-number symbol="×" :number="item.score" /></div>
                </div>
              </div>
              <div class="total">
                <boom-number
                  symbol="+"
                  :number="pointsStore.achievement?.complexTotalPoints ?? '--'"
                  :unit="pointsStore.achievement?.unit"
                />
              </div>
            </div>
          </div>
          <div v-if="checkedType === 'card'" class="list">
            <div class="card-grids">
              <div class="item" v-for="item in cardList" :key="item.icon">
                <div class="item-left">
                  <div class="label">{{ item.label }}</div>
                  <div class="score"><boom-number symbol="×" :number="item.score" /></div>
                </div>
                <div class="item-right">
                  <svg-icon :name="(item.icon ?? '').toLowerCase()"></svg-icon>
                </div>
              </div>
            </div>
            <div class="total">
              <boom-number
                symbol="+"
                :number="pointsStore.achievement?.systemTotalPoints ?? '--'"
                :unit="pointsStore.achievement?.unit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.points-wrapper {
  display: flex;
  width: 100%;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  min-height: 540px;

  border-radius: 32px;
  border: 2px solid rgba(39, 43, 64, 0.36);

  .points-body {
    width: 100%;
    .nav {
      display: flex;
      justify-content: space-between;
      padding: 24px;
      line-height: 24px;
      opacity: 0.5;

      .left {
        display: flex;
        align-items: center;
      }

      .icon {
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        cursor: pointer;

        & + .icon {
          margin-left: 32px;
        }
      }

      .icon-lol {
        background-image: url('@/assets/images/icon-lol.png');
        width: 20px;
        height: 21px;

        &:hover {
          background-image: url('@/assets/images/icon-lol-hover.png');
        }

        &.active,
        &.active:hover {
          background-image: url('@/assets/images/icon-lol-active.png');
        }
      }
      .icon-apex {
        background-image: url('@/assets/images/icon-apex.png');
        width: 20px;
        height: 21px;

        &:hover {
          background-image: url('@/assets/images/icon-apex-hover.png');
        }

        &.active,
        &.active:hover {
          background-image: url('@/assets/images/icon-apex-active.png');
        }
      }
      .icon-valorant {
        background-image: url('@/assets/images/icon-valorant.png');
        width: 19px;
        height: 16px;

        &:hover {
          background-image: url('@/assets/images/icon-valorant-hover.png');
        }

        &.active,
        &.active:hover {
          background-image: url('@/assets/images/icon-valorant-active.png');
        }
      }
      .icon-dota2 {
        background-image: url('@/assets/images/icon-dota2.png');
        width: 18px;
        height: 19px;

        &:hover {
          background-image: url('@/assets/images/icon-dota2-hover.png');
        }

        &.active,
        &.active:hover {
          background-image: url('@/assets/images/icon-dota2-active.png');
        }
      }

      .right {
        color: rgba(#fff, 0.6);
      }
    }

    .card {
      border-radius: 32px;
      border: 0px solid rgba(39, 43, 64, 0.18);
      background-size: cover;
      background-position: center;
      box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);
      overflow: hidden;

      &.lol {
        background-image: url('@/assets/images/bg_lol.png');
      }

      &.apex {
        background-image: url('@/assets/images/bg_apex.png');
      }

      .bg-wrapper {
        display: flex;
        width: 100%;
        // height: 323px;
        padding: 24px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 48px;
        flex-shrink: 0;
        align-self: stretch;
        background: rgba(20, 21, 31, 0.9);
      }

      .button-group {
        width: clamp(270px, 100%, 362px);
        height: 46px;
      }

      .ingame {
        display: flex;

        .left,
        .right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          // gap: 20px;

          .grids {
            display: flex;

            .item {
              width: clamp(120px, 8.33vw, 188px);
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 12px;

              .svg-icon {
                width: 42px;
                height: 42px;
              }

              .label {
                color: rgba(255, 255, 255, 0.6);
                text-align: center;
                font-size: 14px;
                font-weight: 700;
                height: 34px;
                line-height: 120%; /* 16.8px */
                text-transform: capitalize;
              }

              .score {
                color: rgba(255, 255, 255, 0.6);
                font-size: 24px;
                font-weight: 600;
                line-height: 120%; /* 28.8px */
              }

              & + .item {
                margin-left: 20px;
              }
            }
          }

          .total {
            color: #fff;
            font-size: 24px;
            font-weight: 600;
            line-height: 120%;
            padding-bottom: 6px;
          }
        }

        .left {
          padding-right: 20px;
          border-right: 2px solid rgba(39, 43, 64, 0.8);
        }

        .right {
          padding-left: 20px;
        }
      }

      .ingame,
      .list {
        width: 100%;
        overflow-x: auto;

        &::-webkit-scrollbar {
          height: 0;
        }
        // height: 178px;

        .card-grids {
          display: inline-flex;
          gap: 24px;

          .item {
            width: 228px;
            padding: 24px;
            background: linear-gradient(0deg, rgba(39, 43, 64, 0.3) 0%, rgba(39, 43, 64, 0.3) 100%);
            border-radius: 12px;
            border: 0.5px rgba(244, 220, 165, 0.2) solid;
            backdrop-filter: blur(20px);
            justify-content: space-between;
            align-items: center;
            display: inline-flex;

            .item-left {
              flex: 1;

              .label {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                font-weight: 700;
                text-transform: capitalize;
                line-height: 16.8px;
                word-wrap: break-word;
              }

              .score {
                color: rgba(255, 255, 255, 0.6);
                font-size: 24px;
                font-weight: 600;
                line-height: 28.8px;
                word-wrap: break-word;
              }
            }

            .item-right {
              width: 60px;
              height: 60px;

              .svg-icon {
                font-size: 60px;
              }
            }
          }
        }

        .total {
          margin-top: 24px;
          width: 100%;
          text-align: center;
          color: #fff;
          font-size: 24px;
          font-style: normal;
          font-weight: 600;
          line-height: 120%;
        }
      }
    }
  }
}

.grid-item {
  display: flex;
  padding: 8px 12px;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  align-self: stretch;

  border-radius: 16px;
  background: var(--4, rgba(255, 255, 255, 0.04));

  &.active {
    .grid-label {
      color: #ffca47;
    }

    .grid-value {
      cursor: auto;
    }

    background: linear-gradient(
      107deg,
      rgba(255, 202, 71, 0.2) 4.78%,
      rgba(255, 121, 92, 0.2) 96.37%
    );
    border: 1px solid rgba(255, 202, 71, 0.2);
  }

  .grid-label {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    overflow: hidden;
    color: #fff;
    text-align: center;
    font-family: Quicksand;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 16.8px */
    text-transform: uppercase;
  }

  .grid-value {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--BAI, #fff);
    font-family: Quicksand;
    // font-size: 56px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%; /* 43.2px */
    box-sizing: border-box;
    cursor: pointer;

    .svg-icon {
      width: 56px;
      height: 40px;
    }
  }
}
</style>
