<script lang="ts" setup>
import { gsap } from 'gsap'
import { usePointsStore } from '@/stores/points'
import { useUserStore } from '@/stores/user'
import type { GameType } from '@/types/models'
import SvgIcon from '../commons/SvgIcon.vue'
import GP from '@/components/gp.vue'
import { getGameSeasonPoints, getPerceptronCount } from '@/apis/game_tasks'

// 将数字格式化为科学计数法
function formatNumber(n: number, decimalPlaces = 1) {
  if (isNaN(n)) return 'NaN'
  const isNegative = n < 0
  n = Math.abs(n)

  const units = [
    { suffix: 'T', value: 1e12, nextValue: Infinity },
    { suffix: 'G', value: 1e9, nextValue: 1e12 },
    { suffix: 'M', value: 1e6, nextValue: 1e9 },
    { suffix: 'k', value: 1e3, nextValue: 1e6 }
  ]

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    if (n >= unit.value && n < unit.nextValue) {
      let formattedValue = (n / unit.value).toFixed(decimalPlaces)
      formattedValue = formattedValue.replace(/\.0+$/, '') // 移除末尾的.0
      const numericValue = parseFloat(formattedValue)

      // 检查是否需要进位到更大的单位
      const threshold = unit.nextValue / unit.value
      if (numericValue >= threshold) {
        if (i > 0) {
          // 进位到更大的单位
          const higherUnit = units[i - 1]
          let higherValue = (n / higherUnit.value).toFixed(decimalPlaces)
          higherValue = higherValue.replace(/\.0+$/, '')
          return `${isNegative ? '-' : ''}${higherValue}${higherUnit.suffix}`
        }
      }
      return `${isNegative ? '-' : ''}${formattedValue}${unit.suffix}`
    }
  }

  // 小于最小值时直接返回原数字
  return `${isNegative ? '-' : ''}${n.toString()}`
}

interface Game {
  id: number
  name: GameType
  overwolfId: string
  iconUrl?: string
  taskType?: number
  fullName?: string
  shortName?: string
}

const pointsStore = usePointsStore()
const userStore = useUserStore()
const valueStyle = {
  height: '43px',
  font: '800 51px Urbanist',
  lineHeight: '43.2px',
  letterSpacing: '0%',
  textAlign: 'center',
  color: '#121214',
  zIndex: '1000',
  marginTop: '55px'
}
// 窗口宽度
const windowWidth = ref(window.innerWidth)
// GP组件大小样式
const gpSizeStyle = computed(() => {
  if (windowWidth.value >= 1728) {
    return { width: '259px', height: '259px' }
  }
  return { width: '161px', height: '161px' }
})

// 圆圈大小样式
const circleStyles = computed(() => {
  if (windowWidth.value >= 1728) {
    return {
      outer: { width: '316.7px', height: '316.7px' },
      middle: { width: '287.9px', height: '287.9px' }
    }
  }

  // 默认返回值（包括小于375px的情况）
  return {
    outer: { width: '197px', height: '197px' },
    middle: { width: '179px', height: '179px' }
  }
})

// 动态value样式
const dynamicValueStyle = computed(() => {
  if (windowWidth.value > 1440) {
    return valueStyle
  } else {
    return {
      height: '32px',
      font: '800 32px Urbanist',
      lineHeight: '32px',
      letterSpacing: '0%',
      textAlign: 'center',
      color: '#121214',
      zIndex: '1000',
      marginTop: '40px'
    }
  }
})

// 初始化游戏类型 - 默认设为空，等待初始化
const gameType = ref<GameType>(pointsStore.gameType)
const points = ref<string | number>('--')
const rawPoints = ref<string | number>('--')
const perceptronCount = ref<number | string>(0)
// 当前选中的游戏
const currentGame = computed<Game | undefined>(() => {
  return pointsStore.currentSeason.games?.find(
    (item) =>
      item.name === gameType.value || (item.overwolfId === '24504' && gameType.value === 'WUKONG')
  )
})

// NFT数量
const nftQuantity = ref(102)

// 设置默认选中第一个游戏
const initDefaultGame = async () => {
  if (pointsStore.currentSeason.games && pointsStore.currentSeason.games.length > 0) {
    console.log(pointsStore.currentSeason, 'pointsStore.currentSeason.games')
    const firstGame = pointsStore.currentSeason.games[0]
    const type: GameType = firstGame.overwolfId === '24504' ? 'WUKONG' : firstGame.name
    gameType.value = type
    pointsStore.setGameType(type)
    await handleGetPerceptronCount()
    await getPoints(pointsStore.currentSeason.id, firstGame.name)
  }
}

// 切换游戏类型
const toggleGame = async (item: Game, event?: Event) => {
  // 获取当前点击的元素
  const clickedElement = event?.currentTarget as HTMLElement
  // 滚动到点击的元素位置
  if (clickedElement) {
    setTimeout(() => {
      clickedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, 0)
  }
  const type: GameType = item.overwolfId === '24504' ? 'WUKONG' : item.name
  gameType.value = type
  pointsStore.setGameType(type)

  // 重新请求数据
  userStore.accessToken && pointsStore.getGamePoints()
  await getPoints(pointsStore.currentSeason.id, item.name)
}

// 处理收益提升
const handleEarningsBoost = () => {
  window.open('https://magiceden.us/marketplace/perceptron', '_blank')
}
/**
 * 获取用户任务积分
 */
const getPoints = async (gameId: number, gameName: string) => {
  try {
    const res: any = await getGameSeasonPoints(gameId, gameName)
    rawPoints.value = res.points
    points.value = typeof res.points === 'number' ? formatNumber(res.points) : res.points
  } catch (error) {
    console.error(error)
    points.value = '--'
    rawPoints.value = '--'
  }
}

const handleGetPerceptronCount = async () => {
  try {
    const res: any = await getPerceptronCount()
    perceptronCount.value = res.count
  } catch (error) {
    perceptronCount.value = '--'
  }
}

// 监听用户登录和赛季变化
watch(
  () => [userStore.accessToken, pointsStore.currentSeason],
  (newV) => {
    if (newV[0] && newV[1]) {
      pointsStore.getMyAchievement()
      if (pointsStore.currentSeason.games && pointsStore.currentSeason.games.length > 0) {
        initDefaultGame()
      }
    }
  },
  { immediate: true }
)

// 监听游戏列表变化
watch(
  () => pointsStore.currentSeason.games,
  (games) => {
    if (games && games.length > 0) {
      initDefaultGame()
    }
  },
  { immediate: true }
)

const handleAnimation = () => {
  const tl = gsap.timeline()
  tl.from('.dashboard-view', {
    opacity: 0,
    duration: 0.5,
    ease: 'circ.out',
    delay: 0.8
  })
    .from('.dashboard-view .games', {
      opacity: 0,
      duration: 0.5,
      y: 24,
      ease: 'circ.out'
    })
    .from('.game-header', {
      opacity: 0,
      duration: 0.5,
      y: 24,
      ease: 'circ.out'
    })
    .from('.game-card', {
      opacity: 0,
      duration: 0.3,
      x: -24,
      ease: 'circ.out'
    })
    .from(
      '.nft-card',
      {
        opacity: 0,
        duration: 0.3,
        x: 24,
        ease: 'circ.out'
      },
      '-=0.3'
    )
    .from('.desc-header', {
      opacity: 0,
      duration: 0.5,
      y: 24,
      ease: 'circ.out'
    })
    .from('.desc-content', {
      opacity: 0,
      duration: 0.5,
      y: 24,
      ease: 'circ.out'
    })
    .from(
      '.right-section',
      {
        opacity: 0,
        duration: 0.5,
        x: 24,
        ease: 'circ.out'
      },
      '-=0.3'
    )
}

// 监听窗口大小变化
const handleResize = () => {
  console.log('handleResize', window.innerWidth)
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  handleAnimation()
  initDefaultGame()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="points-wrapper">
    <!-- 导航部分 -->
    <div class="game-wrapper">
      <div class="games">
        <div
          class="game-item"
          :class="{
            active:
              pointsStore.currentSeason.games?.length === 1 ||
              gameType === (item.overwolfId === '24504' ? 'WUKONG' : item.fullName)
          }"
          v-for="(item, index) in pointsStore.currentSeason.games"
          :key="item.id"
          @click="toggleGame(item, $event)"
        >
          {{ item.fullName }}
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper" v-if="currentGame">
      <!-- 左侧内容 -->
      <div class="left-section">
        <!-- 上部分：游戏信息和NFT -->
        <div class="game-header">
          <!-- 游戏基本信息块 -->
          <div class="game-card">
            <div class="game-basic-info">
              <img :src="currentGame.iconUrl" class="game-icon" />
              <h2 class="game-name">
                {{ currentGame.fullName }}
              </h2>
            </div>
          </div>

          <!-- NFT信息块 -->
          <div class="nft-card">
            <div class="nft-info">
              <div class="nft-icon-wrapper">
                <div class="nft-icon">
                  <svg-icon name="nft-icon" />
                </div>
                <div class="nft-text">
                  <div class="nft-label">
                    <span>NFT Quantity</span>
                    <div class="info-icon">
                      <svg-icon name="info-circle" />
                      <div class="tooltip">
                        <p>Boosts can stack—the more you hold, the higher the cumulative bonus.</p>
                        <p>The system will periodically scan and update your holdings status.</p>
                      </div>
                    </div>
                  </div>
                  <div class="nft-value">{{ perceptronCount }}</div>
                </div>
              </div>
            </div>
            <button class="earnings-boost" @click="handleEarningsBoost">Buy</button>
          </div>

          <!-- 右侧内容 -->
          <div class="right-section">
            <!-- 上部分：Total Rewards -->
            <div class="gp-wrapper">
              <svgIcon name="hnpq2" class="circle outer" :style="circleStyles.outer" />
              <svgIcon name="hnpq1" class="circle middle" :style="circleStyles.middle" />
              <GP
                :value="points"
                :rawValue="rawPoints"
                gameName="hnq"
                :gpStyle="gpSizeStyle"
                :custostyle="{ color: '#121214' }"
                :valueStyle="dynamicValueStyle"
              />
            </div>
            <!-- 标语 -->
            <div class="slogan" v-if="currentGame && currentGame.fullName">
              <!-- 任务类型 -->
              <div class="task-type-wrapper">
                <div class="task-type" :class="{ 'time-based': currentGame?.taskType === 2 }">
                  <svgIcon :name="currentGame?.taskType === 2 ? 'htd' : 'hed'" class="type-icon" />
                  <span class="type-text">{{
                    currentGame?.taskType === 2 ? 'Time-Based Game' : 'Event-Based Game'
                  }}</span>
                </div>
              </div>
              <!-- 任务描述 -->
              <div class="description-wrapper">
                <div class="description-title">
                  {{ currentGame?.taskType === 2 ? 'Time-Based Game' : 'Event-Based Game' }}
                </div>
                <div class="description">
                  {{
                    currentGame?.taskType === 2
                      ? 'Reward GPT Based On Gameplay Duration'
                      : 'Reward GPT Based On In-Game Event Task Completion'
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 下部分：游戏说明 -->
        <div class="game-desc">
          <div class="desc-left">
            <div class="desc-header">
              <div class="desc-title">Play now & earn</div>
              <div class="desc-subtitle">
                Security Verification: Ensures safe and efficient game operation.
              </div>
            </div>
            <div class="desc-content">
              <div class="desc-main">
                <div class="desc-steps">
                  <div class="step">
                    <svg-icon name="downs" />
                    <span>click to download the APP</span>
                  </div>
                  <div class="step">
                    <svg-icon name="downs" />
                    <span>turn on APP while play the game</span>
                  </div>
                  <div class="step">
                    <svg-icon name="downs" />
                    <span>Start to Play and Game Data Mining</span>
                  </div>
                </div>
                <div class="desc-notes">
                  <div class="note">
                    <div class="dot">
                      <svg-icon name="yuan" />
                    </div>
                    <span>GameBoom Client is currently only supports Windows 10 and above</span>
                  </div>
                  <div class="note">
                    <div class="dot">
                      <svg-icon name="yuan" />
                    </div>
                    <span
                      >Make sure your computer meets the hardware and software requirements for the
                      supported games.</span
                    >
                  </div>
                  <div class="note">
                    <div class="dot">
                      <svg-icon name="yuan" />
                    </div>
                    <span
                      >Be aware of malicious links, make sure to check the website URL before your
                      download.</span
                    >
                  </div>
                  <div class="note">
                    <div class="dot">
                      <svg-icon name="yuan" />
                    </div>
                    <span
                      >To prevent malicious farming, only games over 10 minutes count as valid and
                      rewarded.</span
                    >
                  </div>
                </div>
              </div>
              <div class="desc-right">
                <div class="right">
                  <img class="app" src="@/assets/images/app.png" alt="" />
                  <img class="pc" src="@/assets/images/lol.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:root {
  font-size: calc(100vw / 1280 * 16);
}
.points-wrapper {
  display: flex;
  padding: 1.5rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
  align-self: stretch;
  // background: #ffffff;

  .game-wrapper {
    width: 100%;
    overflow-x: auto;
    padding: 0 0 1rem;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE和Edge */

    &::-webkit-scrollbar {
      display: none; /* Chrome和Safari */
    }
  }

  .games {
    display: flex;
    align-items: center;
    gap: 3rem;
    flex-wrap: nowrap;
    padding: 0 0.25rem;

    .game-item {
      flex-shrink: 0;
      color: #86868b;
      text-align: center;
      font-family: 'Urbanist', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.19em;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        color: #121214;
      }

      &.active {
        color: #121214;
      }
    }
  }

  .content-wrapper {
    display: flex;
    gap: 1.5rem;
    width: 100%;
  }

  /* 左侧部分样式 */
  .left-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-width: 0;

    .game-header {
      display: flex;
      gap: 1.5rem;
      width: 100%;
      position: relative;
      height: 8.75rem;
      .game-card {
        flex: 1;
        // background: white;
        border-radius: 0.75rem;
        // box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
        position: relative;

        .game-basic-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          height: 8.75rem;
          padding-right: 1.5rem;

          .game-icon {
            width: 8.75rem;
            height: 8.75rem;
            box-shadow:
              4rem 3.813rem 1.563rem 0px rgba(29, 29, 31, 0),
              2.563rem 2.438rem 1.438rem 0px rgba(29, 29, 31, 0.02),
              1.438rem 1.375rem 1.188rem 0px rgba(29, 29, 31, 0.06),
              0.625rem 0.625rem 0.875rem 0px rgba(29, 29, 31, 0.1),
              0.188rem 0.125rem 0.5rem 0px rgba(29, 29, 31, 0.12);
            border-radius: 0.875rem;
            object-fit: cover;
          }

          .game-name {
            font-family: Urbanist;
            font-size: 2.75rem;
            font-style: normal;
            font-weight: 700;
            line-height: 1.2em; /* 52.8px */
            letter-spacing: -0.031rem;
          }
        }

        .size-label {
          position: absolute;
          bottom: -1.5rem;
          left: 1.5rem;
          font-size: 0.75rem;
          line-height: 1em;
          color: #86868b;
          background: rgba(134, 134, 139, 0.1);
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
        }
      }

      .nft-card {
        width: 30rem;
        padding: 1.5rem;
        height: 10.25rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0px 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        position: relative;

        .nft-info {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;

          .nft-icon-wrapper {
            display: flex;
            align-items: center;
            gap: 1rem;

            .nft-icon {
              width: 3.5rem;
              height: 3.5rem;
              // background: #1d1d1f;
              border-radius: 0.5rem;
              display: flex;
              align-items: center;
              justify-content: center;

              .svg-icon {
                width: 3.5rem;
                height: 3.5rem;
                color: #1d1d1f;
              }
            }

            .nft-text {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;

              .nft-label {
                color: #575757;
                text-align: center;
                font-family: Urbanist;
                font-size: 0.875rem;
                font-style: normal;
                font-weight: 500;
                line-height: 1.4em; /* 19.6px */
                display: flex;
                align-items: center;
                gap: 0.25rem;
              }

              .nft-value {
                color: #0d0d0d;
                font-family: Urbanist;
                font-size: 1.5rem;
                font-style: normal;
                font-weight: 700;
                line-height: 1.2em; /* 28.8px */
                letter-spacing: -0.0075rem;
              }
            }
          }

          .info-icon {
            width: 1rem;
            height: 1rem;
            color: #86868b;
            cursor: pointer;
            position: relative;
            margin-bottom: 0.25rem;
            .tooltip {
              display: none;
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              margin-top: 0.5rem;
              padding: 0.5rem 0.75rem;
              background: #1d1d1f;
              border-radius: 0.5rem;
              font-size: 0.75rem;
              line-height: 1em;
              color: #ffffff;
              white-space: nowrap;
              z-index: 1000;
              text-align: start;
            }

            &:hover .tooltip {
              display: block;
            }

            .svg-icon {
              width: 1rem;
              height: 1rem;
            }
          }
        }

        .earnings-boost {
          width: 100%;
          height: 3rem;
          background-color: white;
          border-radius: 1.723rem;
          border: 0.094rem solid #0d0d0d;
          border-radius: 6.25rem;
          color: #0d0d0d;
          font-family: Urbanist;
          font-size: 1rem;
          font-style: normal;
          font-weight: 500;
          line-height: 1.2em; /* 19.2px */
          margin-top: 1.5rem;

          &:hover {
            background-color: rgba(0, 0, 0, 0.02);
            border-color: rgba(0, 0, 0, 0.15);
          }
        }

        .size-label {
          position: absolute;
          top: -1.5rem;
          right: 1rem;
          font-size: 0.75rem;
          color: #86868b;
          background: rgba(134, 134, 139, 0.1);
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
        }
      }
    }

    .game-desc {
      padding: 0;
      display: flex;
      gap: 3rem;
      width: calc(100% - 30rem - 3rem);
      margin-right: 1.5rem;

      .desc-left {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        .desc-header {
          .desc-title {
            font-family: 'Urbanist', sans-serif;
            font-size: 1.75rem;
            font-weight: 700;
            line-height: 1.21em;
            color: #121214;
            margin-bottom: 0.5rem;
          }

          .desc-subtitle {
            color: #1d1d1f;
            font-family: Urbanist;
            font-size: 0.875rem;
            font-style: normal;
            font-weight: 500;
            line-height: 1.57em; /* 22px */
          }
        }

        .desc-content {
          background: #ffffff;
          border-radius: 1.5rem;
          padding: 1rem 1.5rem;
          box-shadow: 0px 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
          display: flex;
          gap: 3rem;
          height: auto;
          min-height: 17.5rem;

          .desc-main {
            width: 100%;
            max-width: 35rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;

            .desc-steps {
              display: flex;
              flex-direction: column;
              gap: 1rem;

              .step {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: #1d1d1f;
                font-family: Urbanist;
                font-size: 0.875rem;
                font-style: normal;
                font-weight: 700;
                line-height: 1.5em; /* 21px */
                letter-spacing: 0.0123rem;
                height: 1.313rem;
                span {
                  font-weight: 700;
                }
                .svg-icon {
                  width: 1.5rem;
                  height: 1.5rem;
                  color: #121214;
                }
              }
            }

            .desc-notes {
              display: flex;
              flex-direction: column;
              gap: 0.563rem;

              .note {
                display: inline-flex;
                gap: 0.5rem;
                font-family: Urbanist;
                font-size: 0.75rem;
                font-style: normal;
                font-weight: 500;
                line-height: 1.4em; /* 16.8px */
                color: #ff9500;
                border-radius: 2.5rem;
                padding: 0.219rem 0.5rem;
                width: fit-content;
                align-items: center;

                .dot {
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  .svg-icon {
                    width: 0.375rem;
                    height: 0.366rem;
                    color: currentColor;
                  }
                }
              }
            }
          }

          .desc-right {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: end;

            .right {
              position: relative;
              flex-shrink: 0;

              img {
                display: block;
              }

              .pc {
                width: 21.563rem;
                height: 12.5rem;
                flex-shrink: 0;
              }

              .app {
                position: absolute;
                top: 1.25rem;
                left: -2.875rem;
                height: 10rem;
                z-index: 1;
              }
            }
          }
        }
      }
    }
  }

  .slogan {
    text-align: center;
    margin-top: 3rem;
    width: 100%;
    height: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    .title {
      font-family: Urbanist;
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1.3em;
      letter-spacing: 0%;
      text-align: center;
      color: var(--input-color);
    }

    .description-wrapper {
      width: 100%;
      max-width: 28.5rem;
      margin-top: 1.5rem;
      background: #fafafa;
      border-radius: 0.5rem;
      padding: 1rem;
      max-height: 4.625rem;
      gap: 0.5rem;
      display: flex;
      flex-direction: column;
      .description-title {
        color: #0d0d0d;
        font-family: Urbanist;
        font-size: 0.875rem;
        font-style: normal;
        font-weight: 800;
        line-height: 1.3em; /* 18.2px */
        text-transform: capitalize;
        text-align: left;
      }

      .description {
        color: #666;
        font-family: Urbanist;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 500;
        line-height: 1.3em; /* 15.6px */
        letter-spacing: -0.0038rem;
        text-transform: capitalize;
        text-align: left;
      }
    }
  }

  .task-type-wrapper {
    width: 9.813rem;
    height: 1.5rem;
    margin: 0.5rem auto 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .task-type {
      height: 1.5rem;
      padding: 0.125rem 0.5rem;
      justify-content: center;
      align-items: center;
      gap: 0.25rem;
      background: #feebee;
      border: 0.063rem solid #fcacbb;
      border-radius: 1.5rem;
      text-align: center;
      font-family: Urbanist;
      font-size: 0.875rem;
      font-style: normal;
      font-weight: 500;
      line-height: 1em; /* 100% */
      color: #ff4d45;
      white-space: nowrap;

      &.time-based {
        background: #e7f9f9;
        border: 0.063rem solid #9be6e6;
        color: #0ac2c2;
      }

      .type-icon {
        width: 0.75rem;
        height: 0.75rem;
      }

      .type-text {
        margin-left: 0.25rem;
      }
    }
  }
  .gp-wrapper {
    position: relative;
    width: 13.75rem;
    height: 13.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible !important; // 确保不会被裁剪

    .box-info {
      position: absolute;
      bottom: 1.25rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      width: 3.313rem;
      height: 2.25rem;
      padding: 0.625rem 0.531rem;
      box-sizing: border-box;
      background: #000000;
      border-radius: 2.5rem;
      z-index: 1000;
      border: 0.094rem solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      overflow: visible !important;

      .tooltip {
        display: block !important;
        visibility: visible !important;
        position: absolute;
        // top: -95px; // 根据设计稿调整位置
        // left: 100%;
        transform: translateX(-50%);
        width: 11.375rem; // 根据设计稿宽度
        height: 4.5rem; // 根据设计稿高度
        background: #f5f5f5;
        backdrop-filter: blur(8px);
        border-radius: 0.5rem; // 根据设计稿圆角
        padding: 0.75rem; // 调整内边距
        color: #1c1c1c;
        font-family: Urbanist;
        z-index: 9999;
        pointer-events: none;
        left: 7.563rem;
        top: 2.375rem;

        .tooltip-content {
          p {
            margin: 0;
            font-size: 0.75rem; // 根据设计稿字体大小
            line-height: 1.4em;
            white-space: normal;
            color: #1c1c1c; // 根据设计稿文字颜色

            &:first-child {
              margin-bottom: 0.25rem; // 调整段落间距
            }
          }
        }
      }

      .hbox {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
      }

      .box-value {
        font-family: Urbanist;
        font-size: 0.875rem;
        font-weight: 600;
        color: #ffffff;
        line-height: 1em;
        flex-shrink: 0;
      }
    }

    .circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      &.outer {
        color: #bfbfbf;
      }

      &.middle {
        color: #ffffff;
      }
    }
  }
  /* 右侧部分样式 */
  .right-section {
    width: 31.5rem;
    height: 33.375rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: #fff;
    border-radius: 1.5rem;
    box-shadow: 0px 0.125rem 0.25rem rgba(0, 0, 0, 0.05);

    .gp-wrapper {
      position: relative;
      width: 19.75rem;
      height: 19.75rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .circle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .task-type-wrapper {
      .task-type {
        display: inline-flex;
        padding: 0.5rem 1rem;
        align-items: center;
        gap: 0.5rem;
        border-radius: 6.25rem;

        .type-icon {
          width: 1rem;
          height: 1rem;
        }

        .type-text {
          font-family: 'Urbanist';
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.43em;
        }
      }
    }

    .description-wrapper {
      text-align: center;

      .description {
        font-family: 'Urbanist';
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.43em;
        color: #86868b;
      }
    }
  }
}

@media screen and (min-width: 1921px) {
  .points-wrapper {
    padding: calc(24 * 100vw / 1920);
    gap: calc(32 * 100vw / 1920);

    .games {
      gap: calc(48 * 100vw / 1920);

      .game-item {
        font-size: calc(32 * 100vw / 1920);
        line-height: calc(38 * 100vw / 1920);
      }
    }
  }
}

@media screen and (max-width: 1728px) {
  .points-wrapper {
    .left-section {
      position: relative;

      .game-header {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        gap: 32px;
        height: auto;
        padding-right: 528px; /* 右侧内容宽度(504px) + 间距(24px) */

        .game-card {
          width: 100%;
          height: 140px;
        }

        .nft-card {
          width: 100%;
          height: 218px;

          .earnings-boost {
            margin-top: auto;
          }
        }

        .right-section {
          position: absolute;
          top: 0;
          right: 0;
          width: 504px;
          height: 390px;
          margin-left: 24px;

          .gp-wrapper {
            width: 197px;
            height: 197px;
          }
        }
      }

      .game-desc {
        width: 100%;
        margin-right: 0;
        margin-top: 24px;
      }
    }

    .slogan {
      margin-top: 24px;
    }
  }
}

@media screen and (max-width: 1279px) {
  .points-wrapper {
    .left-section {
      .game-desc {
        .desc-left {
          .desc-content {
            max-height: 100%;
            .desc-right {
              justify-content: center;
            }
            .desc-right .right .pc {
              width: 207px;
              height: 120px;
            }
            .desc-right .right .app {
              width: 57.06px;
              height: 90px;
              position: absolute;
              top: 15px;
              left: -12px;
              z-index: 1;
            }
          }
        }
      }
      .game-header {
        padding-right: 0; /* 移除右侧内容的padding */

        .right-section {
          position: static; /* 取消绝对定位 */
          width: 100%; /* 设置为全宽 */
          height: 390px !important;
          margin-left: 0;
        }
      }
    }
  }
}

@media screen and (max-width: 375px) {
  :root {
    font-size: calc(100vw / 375 * 10.75);
  }
  .points-wrapper {
    gap: 24px;
    .game-wrapper {
      .games {
        .game-item {
          text-align: center;
          font-feature-settings:
            'ss01' on,
            'cv01' on,
            'cv11' on;
          font-family: Urbanist;
          font-size: 24px;
          font-style: normal;
          font-weight: 800;
          line-height: 40px; /* 166.667% */
          letter-spacing: var(--letter-spacing--0_08, -0.076px);
        }
      }
    }
    .left-section {
      .game-header {
        .game-card {
          height: 64px;
          .game-basic-info {
            height: 64px;
            .game-icon {
              width: 64px;
              height: 64px;
            }
            .game-name {
              font-size: 28px;
            }
          }
        }
      }
      .game-desc {
        .desc-left {
          .desc-content {
            display: flex;
            flex-direction: column;
            max-height: 100%;
            .desc-right {
              justify-content: center;
            }
            .desc-right .right .pc {
              width: 207px;
              height: 120px;
            }
            .desc-right .right .app {
              width: 57.06px;
              height: 90px;
              position: absolute;
              top: 15px;
              left: -12px;
              z-index: 1;
            }
          }
        }
      }
      .game-header {
        padding-right: 0; /* 移除右侧内容的padding */

        .right-section {
          .description-wrapper {
            min-width: 295px;
            .description {
              font-size: 11px;
              font-style: normal;
              font-weight: 500;
              line-height: 130%; /* 15.6px */
              letter-spacing: -0.06px;
              text-transform: capitalize;
            }
          }
        }
      }
    }
  }
}
</style>
