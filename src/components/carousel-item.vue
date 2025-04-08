<script lang="ts" setup>
import type { Nft } from '@/types/models'
import { mintNft } from '@/services/NftService'
import { useNftStore } from '@/stores/nft'
import { notification } from 'ant-design-vue'
import SvgIcon from './svg-icon.vue'

const nftStore = useNftStore()

type CountdownDisplays = Map<number, string>

defineProps({
  nft: {
    type: Object as PropType<Nft>,
    default: () => ({})
  },
  countdownDisplays: Object as PropType<CountdownDisplays>
})

const mintClick = async (nftId: any, nftStore: any, mintFunction: string) => {
  const success = await mintNft(nftId, nftStore, mintFunction)
  if (success) {
    notification.open({
      message: () =>
        h(
          'div',
          {
            style: { 'margin-bottom': '0', width: 0 }
          },
          ''
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
              'margin-left': '0'
            }
          },
          'Mint Successfully!'
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
        width: '311px'
      },
      duration: 2,
      icon: () =>
        h(SvgIcon, {
          name: 'checked',
          style: { width: '24px', height: '24px', marginTop: '20px', color: '#70F1B4' }
        })
    })
    console.log('success')
    // TODO: 跳转到mint SBTs的页面
  } else {
    // TODO: 可能需要处理用户取消或失败的情况
  }
}
</script>

<template>
  <div class="carousel-item">
    <div class="left">
      <!-- 使用 nft.image 展示NFT图片，这里的路径需根据实际情况调整 -->
      <img :src="nft.image || '@/assets/images/nft.png'" />
    </div>
    <div class="right">
      <div class="title">{{ nft.displayName }}</div>
      <div v-if="nft.name == 'BOOMER'" class="sub-title">
        <!-- 40,000 GPT REWARD<br /> -->
        TESTING PASS & AIRDROP CREDENTIAL
      </div>
      <div class="desc">{{ nft.description }}</div>
      <div class="progress-wrap">
        <div class="top-info">
          <div v-if="nft.name == 'BOOMER'" class="">MAX SUPPLY: 21,000</div>
          <div v-else class="">LIVE</div>
          <div class="price">
            <div v-if="nft.normalPrice" class="normal-price">
              {{ `${nft.normalPrice} ${nft.priceUnit}` }}
            </div>
            <div v-if="nft.price > 0" class="">{{ `${nft.price} ${nft.priceUnit}` }}</div>
            <div v-else>FREE MINT</div>
          </div>
        </div>
        <a-progress
          :percent="(nft.mintedNumber / nft.maxNumber) * 100"
          :size="[100, 18]"
          title=""
        />
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
      <a-button
        class="button-mint"
        shape="round"
        ghost
        @click="mintClick(nft.id, nftStore, nft.mintFunction)"
        :disabled="!nft.mintEnabled"
      >
        <span>{{ nft.mintButtonText }}</span>
      </a-button>
      <!-- <a-button v-if="nft.name === 'BOOMER'" class="button-mint" shape="round" ghost>
          <a href="https://element.market/collections/genesisboomernft" target="_blank">BUY</a>
        </a-button> -->
      <!-- <div class="tips">Limit 1 mint per wallet</div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carousel-item {
  display: flex !important;
  align-items: center;
  padding-bottom: 40px;
  overflow: hidden;

  .left {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: clamp(580px, calc(580px + 0.125 * (100vw - 1440px)), 640px);
    height: 580px;
    background: rgba(20, 21, 31, 0.65);
    border-radius: 32px;
    border: 2px solid rgba(39, 43, 64, 0.36);
    flex-shrink: 0;

    img {
      width: 300px;
      height: 458px;
      object-fit: cover;
      object-position: center;
    }
  }

  .right {
    display: inline-flex;
    // flex: 1;
    margin-left: 24px;
    margin-right: 5px;
    // min-width: 474px;
    // max-width: 896px;
    width: clamp(474px, calc(100% - 2px), 896px);
    height: 580px;
    padding: 24px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    box-sizing: border-box;

    border-radius: 32px;
    border: 0px solid rgba(255, 255, 255, 0.18);
    background: rgba(20, 21, 31, 0.65);
    box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);
    backdrop-filter: blur(20px);

    .title {
      color: #fff;
      font-size: 32px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 38.4px */
      text-transform: uppercase;
    }

    .sub-title {
      color: #11c5c5;
      font-size: 20px;
      font-weight: 700;
      line-height: 120%; /* 24px */
      text-transform: uppercase;
    }

    .desc {
      color: rgba(255, 255, 255, 0.6);
      padding-bottom: 24px;
      font-size: 16px;
      text-align: left;
      font-weight: 700;
      line-height: 120%; /* 19.2px */
      // text-transform: lowercase;
      border-bottom: 2px solid rgba(39, 43, 64, 0.36);
    }

    .progress-wrap {
      padding: 24px 0;
      width: 100%;

      .top-info {
        display: flex;
        justify-content: space-between;

        div {
          &:first-child {
            color: rgba(255, 255, 255, 0.6);

            font-size: 24px;
            font-style: normal;
            font-weight: 700;
            line-height: 120%; /* 28.8px */
            text-transform: uppercase;
          }

          &:last-child {
            color: #11c5c5;

            font-family: Quicksand;
            font-size: 24px;
            font-style: normal;
            font-weight: 700;
            line-height: 120%; /* 28.8px */
          }
        }
      }

      .price {
        display: flex;
      }

      .normal-price {
        color: #6f6f6f !important;
        font-family: Quicksand;
        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 28.8px */
        text-decoration-line: strikethrough;
        margin-right: 6px;
        text-decoration: line-through;
      }

      :deep(.ant-progress-line) {
        margin-top: 12px;

        .ant-progress-outer {
          margin-inline-end: 0;
          padding-inline-end: 0;
        }

        .ant-progress-inner {
          background: rgba(255, 255, 255, 0.1);
        }

        .ant-progress-bg {
          background: #11c5c5;
        }

        .ant-progress-text {
          display: none;
        }
      }

      .bottom-info {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;

        color: #11c5c5;

        font-family: Quicksand;
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 16.8px */
        // text-transform: uppercase;

        .bt-right {
          span:last-child {
            color: rgba(17, 197, 197, 0.6);
          }
        }
      }
    }

    .button-mint {
      display: flex;
      height: 56px;
      padding: 10px 20px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      align-self: stretch;

      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      line-height: 120%; /* 19.2px */
      color: #ffffff;
      border-radius: 48px;
      border: 1px solid #fff;
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);

      // &.ant-btn-default:not(:disabled):active,
      // &.ant-btn-default:not(:disabled):hover {
      //   color: #f4dca5;
      //   border-color: #f4dca5;
      // }

      &.ant-btn-default:not(:disabled):active {
        opacity: 0.5;
      }
      &.ant-btn-default:not(:disabled):hover {
        opacity: 0.8;
      }

      &:disabled {
        // 不可点击状态的样式
        opacity: 0.3;
      }
    }

    .tips {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 14.4px */
      text-transform: lowercase;
    }
  }
}

@media screen and (max-width: 1140px) {
  .carousel-item {
    flex-direction: column;
    height: auto;
    gap: 24px;

    .left {
      width: 100%;
      // height: auto;
    }
    .right {
      width: calc(100% - 4px);
      height: auto;
      margin: 0;
    }
  }
}
</style>
