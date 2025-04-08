<script lang="ts" setup>
import { useWalletStore } from '@/stores/wallet'
import { disconnectWallet, connectWallet } from '@/services/NftService'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'
import { useTelegramStore } from '@/stores/telegram'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'

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
watch(
  () => modalStore.isSignInModalVisible,
  (newVal) => {
    showModal.value = newVal
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  emit('update:modelValue', false)
}

const open = ref<boolean>(false)

const openLogin = (type: string) => {
  handleClose()
  switch (type) {
    // open register modal
    case 'email':
      open.value = true
      break
    case 'discord':
      break
    case 'meta':
    case 'okx':
    case 'math':
    case 'coinbase':
      if (walletStore.wallet.address) {
        disconnectWallet()
        global.clearAll()
      }
      connectWallet(type)
      break
  }
}

const discordStore = useDiscordStore()
const twitterStore = useTwitterStore()
const telegramStore = useTelegramStore()
const socialLogin = async (type: string) => {
  switch (type) {
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

        handleClose()
      } catch (error) {
        console.error(error)
      }
      break
  }
}
</script>

<template>
  <a-modal
    ref="modalRef"
    v-model:open="showModal"
    :width="688"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="header">
      <div class="title">Log in to GamerBoom</div>
      <div class="desc">
        <!-- By logging in to GameBoom, you agree to
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. -->
      </div>
      <div style="width: 100%; height: 2px; background: rgba(255, 255, 255, 0.04)"></div>
    </div>
    <div class="block-view">
      <div class="title">Sign in with</div>
      <div class="row">
        <div class="btn" @click="openLogin('email')">
          <SvgIcon name="uid-email" /> <span>Email</span>
        </div>
        <div class="btn" @click="socialLogin('twitter')">
          <SvgIcon name="uid-twitter" /> <span>Twitter</span>
        </div>
      </div>
      <div class="row">
        <div class="btn" @click="socialLogin('telegram')">
          <SvgIcon name="uid-telegram" /> <span>Telegram</span>
        </div>
        <div class="btn" @click="socialLogin('discord')">
          <SvgIcon name="uid-discord" /> <span>Discord</span>
        </div>
      </div>
    </div>
    <div class="block-view">
      <div class="title">Sign in with Wallet</div>
      <div class="row">
        <div class="btn" @click="openLogin('meta')">
          <img src="@/assets/images/wallet/metamask.png" />
          <span>Meta Mask</span>
        </div>
        <div class="btn" @click="openLogin('okx')">
          <img src="@/assets/images/wallet/okx.png" />
          <span>OKX Wallet</span>
        </div>
      </div>
      <!-- <div class="row">
        <div class="btn" @click="openLogin('coinbase')">
          <img src="@/assets/images/wallet/coinbase.png" />
          <span>Coinbase Smart Wallet</span>
        </div>
        <div class="btn" @click="openLogin('math')">
          <img src="@/assets/images/wallet/math.png" />
          <span>Math Wallet</span>
        </div>
      </div> -->
    </div>
  </a-modal>
  <modal-register v-model="open"></modal-register>
</template>
<style lang="scss" scoped>
.header {
  display: flex;
  flex: 1;
  padding-bottom: 18px;
  flex-direction: column;
  gap: 7px;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    color: var(--100, #fff);
    font-family: Quicksand;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 26px; /* 108.333% */
  }

  .desc {
    color: var(--100, #fff);
    font-family: Quicksand;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 26px; /* 185.714% */

    a {
      color: var(--100, #fff);
      font-family: Quicksand;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 26px;
      text-decoration-line: underline;
    }
  }
}

.block-view {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;

  .title {
    color: var(--80, rgba(255, 255, 255, 0.8));
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%; /* 25.6px */
  }

  .row {
    display: flex;
    padding: 12px;
    align-items: flex-start;
    gap: 16px;
    align-self: stretch;

    .btn {
      display: flex;
      height: 48px;
      padding: 10px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      flex: 1 0 0;

      color: var(--100, #fff);
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 160%; /* 25.6px */
      cursor: pointer;

      border-radius: 32px;
      border: 1px solid var(--100, #fff);
      background: var(--4, rgba(255, 255, 255, 0.04));

      .svg-icon {
        width: 24px;
        height: 24px;
      }

      img {
        width: 24px;
        height: 24px;
      }

      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 0.5;
      }
    }

    @media screen and (max-width: 450px) {
      flex-direction: column;
      .btn {
        width: 100%;
      }
    }
  }
}
</style>
<style>
:deep(.ant-modal) {
  .ant-modal-content {
    display: flex;
    width: 688px;
    padding: 24px;
    flex-direction: column;
    border-radius: 24px;
    border: 2px solid rgba(39, 43, 64, 0.36);
    background: #191a28;

    .ant-modal-body {
      display: flex;
      flex-direction: column;
      padding: 0 0 18px;
      width: 100%;
      gap: 24px;
    }
  }
}
</style>
