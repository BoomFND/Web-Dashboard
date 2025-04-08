<script lang="ts" setup>
import { useConnect, type Connector, useChainId } from '@wagmi/vue'
import { useWalletStore } from '@/stores/wallet'
import { useWallet } from '@/hooks/useWallet'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { message } from 'ant-design-vue'
import { ref, watch } from 'vue'

const chainId = useChainId()
const { connectAsync, connectors, error, status } = useConnect()

const popularConnectors = ref<Array<Connector>>(connectors.slice(0, 4))
console.log(popularConnectors.value.length)

const installedConnects = ref<Array<Connector>>(connectors.slice(4))

const connectorNames = popularConnectors.value.map((item) => item.name)
connectorNames.forEach((item) => {
  if (item === 'MetaMask' && window.ethereum) {
    const index = popularConnectors.value.findIndex((connector) => connector.name === 'MetaMask')
    installedConnects.value.push(popularConnectors.value[index])
    popularConnectors.value.splice(index, 1)
  } else {
    if (installedConnects.value.find((connector) => connector.name === item)) {
      const index = popularConnectors.value.findIndex((connector) => connector.name === item)
      popularConnectors.value.splice(index, 1)
    }
  }
})

console.log(popularConnectors.value, installedConnects.value)

// 定义双向绑定的modelValue
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()

// 通过watch监听modelValue，实现数据的修改
const showModal = ref(false)
watch(
  () => props.modelValue,
  (newV) => {
    showModal.value = newV
  }
)

const global = useUserStore()
const walletStore = useWalletStore()

// 监听用户登录，重新获取用户信息
watch(
  () => global.accessToken,
  () => {
    global.fetchAccountInfo()
  }
)

const modalStore = useModalStore()
// watch(
//   () => modalStore.isSignInModalVisible,
//   (newVal) => {
//     showModal.value = newVal
//   }
// )

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  emit('update:modelValue', false)
}

const handleConnect = async (connector: Connector) => {
  try {
    await connectAsync({ connector, chainId: chainId.value })
    walletStore.wallet = {
      chainId: chainId.value,
      address: global.account.walletAddress
    }

    showModal.value = false
  } catch (error: any) {
    console.error(error)
    if (error.message.includes('Provider not found')) {
      switch (connector.id) {
        case 'metaMaskSDK':
          window.open('https://metamask.io/download', '_blank')
          break
        case 'okxWallet':
        case 'com.okex.wallet':
          window.open('https://www.okx.com/zh-hans/download', '_blank')
          break
        case 'binanceWallet':
          window.open('https://www.bnbchain.org/en/binance-wallet', '_blank')
          break
        case 'coinbaseWallet':
          window.open('https://www.coinbase.com/wallet/downloads', '_blank')
          break
        case 'walletConnect':
          window.open('https://walletconnect.com/downloads', '_blank')
          break
      }
    } else if (error.message.includes()) {
    } else {
      message.error(error.message)
    }
  }
}
</script>

<template>
  <a-modal wrapClassName="custom-modal modal-link-wallet" ref="modalRef" v-model:open="showModal" :width="480"
    :footer="null" :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="title">Link Wallet</div>
      <SvgIcon name="header-close" @click="$emit('update:modelValue', false)"></SvgIcon>
    </div>
    <section class="block">
      <div class="label">Wallet installed</div>
      <div class="list">
        <template v-for="connector in installedConnects" :key="connector.id">
          <div class="item" v-if="connector.name">
            <div class="item__left">
              <div class="icon-wrapper">
                <img v-if="connector.icon" :src="connector.icon" alt="" />
                <SvgIcon v-else name="entry-metamask"></SvgIcon>
              </div>
              <span>{{ connector.name }}</span>
            </div>
            <div class="item__right">
              <div class="button button-default" @click="handleConnect(connector)">Connect</div>
            </div>
          </div>
        </template>
      </div>
    </section>
    <section class="block">
      <div class="label">Popular</div>
      <div class="list">
        <template v-for="connector in popularConnectors" :key="connector.id">
          <div class="item" v-if="connector.name">
            <div class="item__left">
              <div class="icon-wrapper">
                <img v-if="connector.icon" :src="connector.icon" alt="" />
                <SvgIcon v-else-if="connector.name === 'MetaMask'" name="entry-metamask"></SvgIcon>
                <SvgIcon v-else-if="connector.name === 'WalletConnect'" name="entry-walletConnect"></SvgIcon>
                <SvgIcon v-else-if="connector.name === 'OKX Wallet'" name="entry-okx"></SvgIcon>
                <SvgIcon v-else-if="connector.name === 'Binance Wallet'" name="entry-binance"></SvgIcon>
              </div>
              <span>{{ connector.name }}</span>
            </div>
            <div class="item__right">
              <div class="button button-default" @click="handleConnect(connector)">Connect</div>
            </div>
          </div>
        </template>
      </div>
    </section>
  </a-modal>
</template>

<style lang="scss" scoped>
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;

  .title {
    color: var(--color-primary);
    font-size: 28px;
    font-weight: 800;
    line-height: 130%;
    letter-spacing: -0.56px;
  }

  .svg-icon {
    width: 20px;
    height: 20px;
    color: #1d1d1f;
    flex-shrink: 0;
    cursor: pointer;
  }
}

.block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;

  .block-header {
    display: flex;
    justify-content: space-between;
    flex: 1;
    align-self: stretch;

    .arrow-wrapper {
      display: flex;
      width: 20px;
      height: 20px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .svg-icon {
        width: 14.94px;
        height: 8px;
        flex-shrink: 0;
        color: #808082;
      }

      &.reverse {
        transform: rotate(180deg);
      }
    }
  }

  .label {
    color: var(--color-dialog-label);
    font-family: Urbanist;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 150%;
  }

  .list {
    width: 100%;
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .item {
      display: flex;
      height: 64px;
      padding: 16px;
      justify-content: space-between;
      align-items: center;
      align-self: stretch;
      border-radius: 12px;
      background: var(--color-dialog-item-background);
      cursor: pointer;

      .item__left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;

        .icon-wrapper {
          display: flex;
          width: 32px;
          height: 32px;
          justify-content: center;
          align-items: center;
          gap: 13.333px;
          border-radius: 5.333px;

          .svg-icon,
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }
        }

        span {
          color: #1d1d1f;
          font-family: Urbanist;
          font-size: 16px;
          font-style: normal;
          font-weight: 600;
          line-height: 20px;
          /* 125% */
        }
      }

      .item__right {
        .button {
          width: 90px;
          height: 36px;
          padding: 0px 16px;
          border-radius: 40px;
        }
      }
    }
  }
}
</style>