<script lang="ts" setup>
import { useWalletStore } from '@/stores/wallet'
import { useWallet } from '@/hooks/useWallet'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'
import { useTelegramStore } from '@/stores/telegram'
import { useUserStore } from '@/stores/user'
import { useModalStore, type LoginEntryConnectType, type LoginEntryType } from '@/stores/modal'
import type { EvmWallet, Wallet } from '@/types/wallet'
import { ref, watch } from 'vue'

// 定义双向绑定的modelValue
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()

// 通过watch监听modelValue，实现数据的修改
const showModal = ref<boolean>(false)
const isSocialShow = ref<boolean>(false)
const loginEntryType = ref<LoginEntryType>('all')
const loginEntryConnectType = ref<LoginEntryConnectType>('login')

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
watch(
  () => modalStore.isLoginEntryVisible,
  (newVal) => {
    showModal.value = newVal
  }
)
watch(
  () => modalStore.loginEntryType,
  (newVal) => {
    loginEntryType.value = newVal
  }
)
watch(
  () => modalStore.loginEntryConnectType,
  (newVal) => {
    loginEntryConnectType.value = newVal
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  modalStore.toggleLoginEntryModal(false)
  emit('update:modelValue', false)
}

const open = ref<boolean>(false)
const showCombineAccount = ref<boolean>(false)
const { connectWallet, solanaWallets, connectSolana } = useWallet()

const discordStore = useDiscordStore()
const twitterStore = useTwitterStore()
const telegramStore = useTelegramStore()

// Solana钱包登录
const solanaWalletLogin = async (wallet: Wallet, type: LoginEntryConnectType = 'login') => {
  await connectSolana(wallet, type)
  handleClose()
}

// EVM钱包登录
const evmWalletLogin = async (wallet: EvmWallet, type: LoginEntryConnectType = 'login') => {
  await connectWallet(wallet, type)
  if (walletStore.needCombineAccounts.length > 0) {
    showCombineAccount.value = true
  }
  handleClose()
}

// 处理社交登录
const socialLogin = async (type: string) => {
  switch (type) {
    case 'email':
      open.value = true
      handleClose()
      break
    case 'discord':
      sessionStorage.setItem('discordType', 'login')
      discordStore.fetchUrl()
      handleClose()
      break
    case 'twitter':
      sessionStorage.setItem('twitterType', 'login')
      twitterStore.fetchUrl()
      handleClose()
      break
    case 'telegram':
      try {
        // telegram比较特别，再tg那边不是返回链接，而是获取到用户信息
        const { userId, username, first_name, last_name }: any = await telegramStore.fetchUrl()
        // 直接调用后端接口登录
        telegramStore.telegramLoginOrRegister(userId, username, first_name + ' ' + last_name, true)
        if (global.accessToken) {
          connectWallet('metaMaskSDK')
        }
        handleClose()
      } catch (error) {
        console.error(error)
      }
      break
  }
}
</script>

<template>
  <a-modal wrapClassName="custom-modal modal-entry" ref="modalRef" v-model:open="showModal" :width="480" :footer="null"
    :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="title">
        <template v-if="loginEntryConnectType === 'login'">
          Log in to GamerBoom
        </template>
        <template v-else-if="loginEntryConnectType === 'connect'">
          Connect Wallet
        </template>
        <template v-else-if="loginEntryConnectType === 'bind'">
          Bind Wallet
        </template>
      </div>
      <SvgIcon name="header-close" @click="handleClose()"></SvgIcon>
    </div>
    <section class="block" v-if="!!loginEntryType && (loginEntryType === 'evm' || loginEntryType === 'all')">
      <div class="label">EVM Chain</div>
      <div class="list">
        <div class="item">
          <div class="item__left">
            <div class="icon-wrapper">
              <SvgIcon name="entry-metamask"></SvgIcon>
            </div>
            <span>MetaMask</span>
          </div>
          <div class="item__right">
            <div class="button button-default"
              @click="evmWalletLogin('metaMaskSDK', loginEntryType === 'evm' ? 'connect' : undefined)">Connect</div>
          </div>
        </div>
        <div class="item">
          <div class="item__left">
            <div class="icon-wrapper">
              <SvgIcon name="entry-binance"></SvgIcon>
            </div>

            <span>Binance Wallet</span>
          </div>
          <div class="item__right">
            <div class="button button-default"
              @click="evmWalletLogin('binanceWallet', loginEntryType === 'evm' ? 'connect' : undefined)">Connect</div>
          </div>
        </div>
        <div class="item">
          <div class="item__left">
            <div class="icon-wrapper">
              <SvgIcon name="entry-okx"></SvgIcon>
            </div>

            <span>OKX Wallet</span>
          </div>
          <div class="item__right">
            <div class="button button-default"
              @click="evmWalletLogin('okxWallet', loginEntryType === 'evm' ? 'connect' : undefined)">Connect</div>
          </div>
        </div>
        <div class="item">
          <div class="item__left">
            <div class="icon-wrapper">
              <SvgIcon name="entry-walletConnect"></SvgIcon>
            </div>

            <span>WalletConnect</span>
          </div>
          <div class="item__right">
            <div class="button button-default"
              @click="evmWalletLogin('walletConnect', loginEntryType === 'evm' ? 'connect' : undefined)">Connect</div>
          </div>
        </div>
      </div>
    </section>

    <section class="block" v-if="!!loginEntryType && (loginEntryType === 'solana' || loginEntryType === 'all')">
      <div class="label">Solana Chain</div>
      <div class="list">
        <div class="item" v-for="wallet in solanaWallets.filter((w) => w.adapter.name !== 'MetaMask')"
          :key="wallet.adapter.name">
          <div class="item__left">
            <div class="icon-wrapper">
              <img :src="wallet.adapter.icon" alt="wallet icon" />
            </div>
            <span>{{ wallet.adapter.name }}</span>
          </div>
          <div class="item__right">
            <div class="button button-default"
              @click="solanaWalletLogin(wallet, loginEntryType === 'solana' ? 'connect' : undefined)">Connect</div>
          </div>
        </div>
      </div>
    </section>

    <section class="block social" v-if="!!loginEntryType && (loginEntryType === 'social' || loginEntryType === 'all')">
      <div class="block-header" @click="isSocialShow = !isSocialShow">
        <div class="label">Sign in with Social Media</div>
        <div class="arrow-wrapper" :class="{ reverse: !isSocialShow }">
          <SvgIcon name="common-arrow-up" />
        </div>
      </div>
      <Transition name="slide-down">
        <div class="list" v-if="isSocialShow">
          <div class="item">
            <div class="item__left">
              <div class="icon-wrapper">
                <SvgIcon name="entry-tg"></SvgIcon>
              </div>
              <span>Telegram</span>
            </div>
            <div class="item__right">
              <div class="button button-default" @click="socialLogin('telegram')">Connect</div>
            </div>
          </div>
          <div class="item">
            <div class="item__left">
              <div class="icon-wrapper">
                <SvgIcon name="entry-discord"></SvgIcon>
              </div>

              <span>Discord</span>
            </div>
            <div class="item__right">
              <div class="button button-default" @click="socialLogin('discord')">Connect</div>
            </div>
          </div>
          <div class="item">
            <div class="item__left">
              <div class="icon-wrapper">
                <SvgIcon name="entry-x"></SvgIcon>
              </div>

              <span>X</span>
            </div>
            <div class="item__right">
              <div class="button button-default" @click="socialLogin('twitter')">Connect</div>
            </div>
          </div>
          <div class="item">
            <div class="item__left">
              <div class="icon-wrapper">
                <SvgIcon name="entry-email"></SvgIcon>
              </div>

              <span>Email</span>
            </div>
            <div class="item__right">
              <div class="button button-default" @click="socialLogin('email')">Connect</div>
            </div>
          </div>
        </div>
      </Transition>
      <ModalLogin v-model="open" />
    </section>
    <CombineData v-model="showCombineAccount" />
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
          border-radius: 8px;
          overflow: hidden;

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

  &.social .list {
    will-change: height, opacity;
    transition:
      height 0.2s cubic-bezier(0.645, 0.045, 0.355, 1),
      opacity 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}
</style>
