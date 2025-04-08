<script lang="ts" setup>
import type { Nft } from '@/types/models'
import { mintNft } from '@/services/NftService'
import { useNftStore } from '@/stores/nft'
import { notification } from 'ant-design-vue'
import { useDownload } from '@/hooks/useDownload'

import SvgIcon from '@/components/commons/SvgIcon.vue'

const nftStore = useNftStore()
const { donwload } = useDownload()

type CountdownDisplays = Map<number, string>

defineProps({
  nft: {
    type: Object as PropType<Nft>,
    default: () => ({}),
  },
  countdownDisplays: Object as PropType<CountdownDisplays>,
})

const mintClick = async (nftId: any, nftStore: any, mintFunction: string) => {
  const success = await mintNft(nftId, nftStore, mintFunction)
  if (success) {
    notification.open({
      message: () =>
        h(
          'div',
          {
            style: { 'margin-bottom': '0', width: 0 },
          },
          '',
        ),
      description: () =>
        h(
          'div',
          {
            style: {
              color: '#fff',
              'font-size': '20px',
              'font-weight': 700,
              'line-height': '160%',
              'margin-inline-start': '17px',
              'margin-left': '0',
            },
          },
          'Mint Successfully!',
        ),
      closeIcon: () =>
        h(SvgIcon, { name: 'close', style: { width: '24px', height: '24px', marginTop: '20px' } }),
      style: {
        display: 'inline-flex',
        padding: '24px 14px 24px 24px',
        alignItems: 'center',
        background: '#191A28',
        border: '2px solid rgba(39, 43, 64, 0.36)',
        'border-radius': '24px',
        width: '311px',
      },
      duration: 2,
      icon: () =>
        h(SvgIcon, {
          name: 'checked',
          style: { width: '24px', height: '24px', marginTop: '20px', color: '#70F1B4' },
        }),
    })
    console.log('success')
    // TODO: 跳转到mint SBTs的页面
  } else {
    // TODO: 可能需要处理用户取消或失败的情况
  }
}

const handleGuide = () => {
  window.open(
    'https://gamerboom.medium.com/embark-on-wukongs-web3-odyssey-your-ultimate-guide-to-starting-the-journey-9186a85ce824',
    '_blank',
  )
}

const videoRef = ref()
onMounted(() => {
  if (videoRef.value) {
    videoRef.value?.load()
    videoRef.value?.play()
  }
})
</script>

<template>
  <div class="carousel-item">
    <div
      class="left"
      :class="{ 'wukong-wrapper': nft.name.toLocaleLowerCase().includes('wukong') }"
    >
      <div v-if="nft.video" class="video-wrapper">
        <video ref="videoRef" :src="nft.video" preload="auto" controls autoplay muted loop></video>
      </div>
      <!-- 使用 nft.image 展示NFT图片，这里的路径需根据实际情况调整 -->
      <img
        :class="{
          special: nft.displayName === 'opBNB SBT' || nft.displayName === 'Epic Gold Shovel',
        }"
        v-else-if="nft.image"
        :src="nft.image"
      />
    </div>
    <div class="right">
      <div class="top">
        <div class="title">{{ nft.displayName }}</div>
        <div v-if="nft.name == 'BOOMER'" class="sub-title">
          <!-- 40,000 GPT REWARD<br /> -->
          TESTING PASS & AIRDROP CREDENTIAL
        </div>
        <div class="desc">{{ nft.description }}</div>
      </div>
      <div v-if="!nft.name.toLocaleLowerCase().includes('wukong')" class="progress-wrap">
        <div class="top-info">
          <div class="live" v-if="nft.name == 'BOOMER'">MAX SUPPLY: 21,000</div>
          <div class="live" v-else>
            <SvgIcon name="common-live" />
            <div class="text">LIVE</div>
          </div>
          <div class="price">
            <div v-if="nft.normalPrice" class="normal-price">
              {{ `${nft.normalPrice} ${nft.priceUnit}` }}
            </div>
            <div v-if="nft.price > 0" class="">{{ `${nft.price} ${nft.priceUnit}` }}</div>
            <div v-else>FREE MINT</div>
          </div>
        </div>
        <a-progress :percent="(nft.mintedNumber / nft.maxNumber) * 100" :size="[100, 8]" title="" />
        <div class="bottom-info">
          <div class="bt-left">{{ countdownDisplays?.get(nft.id) }}</div>
          <div class="bt-right">
            <!-- 仅在 nft.maxNumber 不为 0 时显示 mintedNumber 和 maxNumber -->
            <template v-if="nft.id == 2">
              <span>{{ nft.mintedNumber }}</span>
              <span>/{{ nft.maxNumber }}</span>
            </template>
            <!-- 当 nft.maxNumber 为 0 时，不显示 mintedNumber，仅显示无穷大符号 -->
            <span v-else></span>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div
          v-if="!nft.name.toLocaleLowerCase().includes('wukong')"
          class="button button-primary"
          shape="round"
          ghost
          @click="mintClick(nft.id, nftStore, nft.mintFunction)"
          :disabled="!nft.mintEnabled"
        >
          <SvgIcon name="common-mint" />
          <span class="text">{{ nft.mintButtonText }}</span>
        </div>
        <div v-else class="button-wrapper">
          <div class="button button-primary" shape="round" ghost @click="handleGuide">
            <span class="text">USER GUIDE</span>
          </div>
          <div class="button button-primary" shape="round" ghost @click="donwload">
            <SvgIcon name="windows" style="width: 18px; height: 18px" />
            <span class="text">Download & Play</span>
          </div>
        </div>

        <div v-if="nft.name.toLocaleLowerCase().includes('wukong')" class="tips">
          Available on Windows
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carousel-item {
  display: flex !important;
  align-items: center;
  gap: 24px;
  height: calc(100vh - 184px);
  overflow: hidden;

  .left {
    flex: 1;
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: clamp(580px, calc(580px + 0.125 * (100vw - 1440px)), 640px);
    height: 100%;
    border-radius: 24px;
    flex-shrink: 0;
    padding: 0 20px;
    overflow: hidden;

    &.wukong-wrapper::before {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-image: url('@/assets/images/bg_wukong_nft.png');
      background-size: cover;
      background-position: top right;
      background-repeat: no-repeat;
      opacity: 0.2;
      z-index: -1;
    }

    img {
      max-width: 100%;
      max-height: 458px;
      object-fit: cover;
      object-position: center;
    }

    .special {
      max-width: none;
      max-height: none;
      width: calc(100% + 88px);
      height: 100%;
      margin-left: -44px;
      margin-right: -44px;
    }

    .video-wrapper {
      display: flex;
      width: 100%;
      height: auto;
      border-radius: 20px 20px;
      overflow: hidden;

      video {
        width: 100%;
      }
    }

    @media (max-width: 375px) {
      height: 220px;
    }
  }

  .right {
    flex: 1;
    display: inline-flex;
    width: clamp(474px, calc(100% - 2px), 896px);
    height: 100%;
    padding: 64px 72px;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    box-sizing: border-box;

    border-radius: 24px;
    border: 0px solid rgba(255, 255, 255, 0.18);
    background: var(--color-white);

    .top {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      align-self: stretch;

      .title {
        color: var(--color-primary);
        text-align: center;
        font-size: 52px;
        font-weight: 800;
        line-height: 115.385%;
        letter-spacing: -0.076px;
      }

      .sub-title {
        color: #11c5c5;
        font-size: 20px;
        font-weight: 700;
        line-height: 120%; /* 24px */
        text-transform: uppercase;
      }

      .desc {
        color: var(--color-primary);
        text-align: center;
        font-size: 24px;
        font-weight: 500;
        line-height: 133.333%;
        letter-spacing: 0.048px;
      }
    }

    .progress-wrap {
      display: flex;
      flex-direction: column;
      width: 100%;

      .top-info {
        display: flex;
        justify-content: space-between;

        .live {
          display: flex;
          align-items: center;
          gap: 4px;

          .svg-icon {
            width: 24px;
            height: 24px;
          }

          .text {
            color: var(--color-primary);
            font-size: 20px;
            font-weight: 600;
            line-height: 140%;
          }
        }

        .price {
          display: flex;
          align-items: center;
          color: var(--color-primary);
          font-size: 28px;
          font-weight: 700;
          line-height: 114.286%;
        }
      }

      :deep(.ant-progress-line) {
        margin-top: 16px;
        margin-inline-end: 0;
        margin-bottom: 0;
        line-height: 100%;

        .ant-progress-outer {
          margin-inline-end: 0;
          padding-inline-end: 0;
        }

        .ant-progress-inner {
          background: var(--color-progress-background);
        }

        .ant-progress-bg {
          background: var(--color-primary);
        }

        .ant-progress-text {
          display: none;
        }
      }

      .bottom-info {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;

        color: var(--color-primary);
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%;

        .bt-right {
          span:last-child {
            color: rgba(var(--color-primary-rgb), 0.6);
          }
        }
      }
    }

    .bottom {
      width: 100%;

      .button {
        height: 56px;
        font-size: 20px;
      }
    }

    .button-wrapper {
      display: flex;
      flex-direction: column-reverse;
      width: 100%;
      gap: 24px;
    }

    .tips {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%;
      text-transform: lowercase;
    }
  }
}

@media screen and (min-width: 1921px) {
  .carousel-item {
    gap: calc(24 * 100vw / 1920);
    height: calc(100vh - calc(184 * 100vw / 1920));

    .left {
      width: clamp(580px, calc(580px + 0.125 * (100vw - 1440px)), calc(640 * 100vw / 1920));
      border-radius: calc(24 * 100vw / 1920);
      padding: 0 calc(20 * 100vw / 1920);

      img {
        max-height: calc(458 * 100vw / 1920);
      }

      .special {
        width: calc(100% + 88px);
        margin-left: calc(-44 * 100vw / 1920);
        margin-right: calc(-44 * 100vw / 1920);
      }

      .video-wrapper {
        border-radius: calc(20 * 100vw / 1920) calc(20 * 100vw / 1920);
      }

      @media (max-width: 375px) {
        height: calc(220 * 100vw / 1920);
      }
    }

    .right {
      width: clamp(474px, calc(100% - 2px), calc(896 * 100vw / 1920));
      padding: calc(64 * 100vw / 1920) calc(72 * 100vw / 1920);
      gap: calc(24 * 100vw / 1920);
      border-radius: 24px;

      .top {
        gap: calc(32 * 100vw / 1920);

        .title {
          font-size: calc(52 * 100vw / 1920);
        }

        .sub-title {
          font-size: calc(20 * 100vw / 1920);
        }

        .desc {
          font-size: calc(24 * 100vw / 1920);
        }
      }

      .progress-wrap {
        .top-info {
          .live {
            gap: 4px;

            .svg-icon {
              width: calc(24 * 100vw / 1920);
              height: calc(24 * 100vw / 1920);
            }

            .text {
              font-size: calc(20 * 100vw / 1920);
            }
          }

          .price {
            font-size: calc(28 * 100vw / 1920);
          }
        }

        :deep(.ant-progress-line) {
          margin-top: calc(16 * 100vw / 1920);
        }

        .bottom-info {
          margin-top: calc(12 * 100vw / 1920);
          font-size: calc(14 * 100vw / 1920);
        }
      }

      .bottom {
        .button {
          height: calc(56 * 100vw / 1920);
          font-size: calc(20 * 100vw / 1920);
        }
      }

      .button-wrapper {
        gap: calc(24 * 100vw / 1920);
      }

      .tips {
        font-size: calc(12 * 100vw / 1920);
      }
    }
  }
}

@media screen and (max-width: 1140px) {
  .carousel-item {
    flex-direction: column;
    height: auto;

    .left {
      width: 100%;
      // height: auto;
    }
    .right {
      width: 100%;
      height: auto;
      margin: 0;
    }
  }
}

@media screen and (max-width: 834px) {
  .carousel-item .right {
    padding: clamp(20px, calc(64px - 44 / 459 * (834px - 100vw)), 64px)
      clamp(24px, calc(72px - 48 / 459 * (834px - 100vw)), 72px);

    .top {
      gap: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);

      .title {
        font-size: clamp(24px, calc(52px - 28 / 459 * (834px - 100vw)), 52px);
      }

      .desc {
        font-size: clamp(12px, calc(24px - 12 / 459 * (834px - 100vw)), 24px);
      }
    }

    .progress-wrap {
      .top-info {
        .live {
          .svg-icon {
            width: clamp(16px, calc(24px - 8 / 459 * (834px - 100vw)), 24px);
            height: clamp(16px, calc(24px - 8 / 459 * (834px - 100vw)), 24px);
          }

          .text {
            font-size: clamp(16px, calc(20px - 4 / 459 * (834px - 100vw)), 20px);
          }
        }

        .price {
          font-size: clamp(18px, calc(28px - 10 / 459 * (834px - 100vw)), 28px);
        }
      }
    }

    .bottom .button {
      height: clamp(44px, calc(56px - 12 / 459 * (834px - 100vw)), 56px);

      .svg-icon {
        width: clamp(16px, calc(20px - 4 / 459 * (834px - 100vw)), 20px);
        height: clamp(16px, calc(20px - 4 / 459 * (834px - 100vw)), 20px);
      }

      .text {
        font-size: clamp(16px, calc(20px - 4 / 459 * (834px - 100vw)), 20px);
      }
    }
  }
}
</style>
