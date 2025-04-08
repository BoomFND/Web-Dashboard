<script lang="ts" setup>
import { connectWallet } from '@/services/NftService'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'
import { useTelegramStore } from '@/stores/telegram'
import { useWalletStore } from '@/stores/wallet'
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
const defaultColor = ref('#8D8D8D')
const hoverColor = ref('#FFFFFF')
const hoverBtn = ref('')
</script>

<template>
  <a-modal
    ref="modalRef"
    v-model:open="showModal"
    :width="688"
    :footer="null"
    @cancel="handleClose"
  >
    <template #closeIcon>
      <SvgIcon name="close" />
    </template>
    <div class="header">
      <div class="title">Log in to GamerBoom</div>
      <div class="desc">
        By logging in to GameBoom, you agree to
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
    <div class="block-view">
      <div class="title">Sign in with</div>
      <div class="row">
        <div
          class="btn"
          @click="socialLogin('twitter')"
          @mouseover="hoverBtn = 'twitter'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon name="uid-twitter" :color="hoverBtn === 'twitter' ? hoverColor : defaultColor" />
        </div>
        <div
          class="btn"
          @click="socialLogin('telegram')"
          @mouseover="hoverBtn = 'telegram'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon
            name="uid-telegram"
            :color="hoverBtn === 'telegram' ? hoverColor : defaultColor"
          />
        </div>
        <div
          class="btn"
          @click="socialLogin('discord')"
          @mouseover="hoverBtn = 'discord'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon name="uid-discord" :color="hoverBtn === 'discord' ? hoverColor : defaultColor" />
        </div>
        <div
          class="btn"
          @click="openLogin('email')"
          @mouseover="hoverBtn = 'email'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon name="uid-email" :color="hoverBtn === 'email' ? hoverColor : defaultColor" />
        </div>
      </div>
    </div>
    <div class="block-view">
      <div class="title">Sign in with Wallet</div>
      <div class="row">
        <div
          class="btn btn2"
          @click="openLogin('meta')"
          @mouseover="hoverBtn = 'metamask'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon v-if="hoverBtn == 'metamask'" name="wallet-metamask_hover" />
          <SvgIcon v-else name="wallet-metamask" />
        </div>
        <div
          class="btn btn2"
          @click="openLogin('okx')"
          @mouseover="hoverBtn = 'okx'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon v-if="hoverBtn == 'okx'" name="wallet-okx_hover" />
          <SvgIcon v-else name="wallet-okx" />
        </div>
      </div>
      <div class="row">
        <div
          class="btn btn2"
          @click="openLogin('coinbase')"
          @mouseover="hoverBtn = 'coinbase'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon v-if="hoverBtn == 'coinbase'" name="wallet-coinbase_hover" />
          <SvgIcon v-else name="wallet-coinbase" />
        </div>
        <div
          class="btn btn2"
          @click="openLogin('math')"
          @mouseover="hoverBtn = 'math_wallet'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon v-if="hoverBtn == 'math_wallet'" name="wallet-math_wallet_hover" />
          <SvgIcon v-else name="wallet-math_wallet" />
        </div>
      </div>
    </div>
  </a-modal>
  <modal-register v-model="open"></modal-register>
</template>

<style lang="scss" scoped></style>
<style>
.ant-modal {
  .ant-modal-content {
    display: flex;
    width: 688px;
    padding: 32px;
    flex-direction: column;
    border-radius: 16px;
    border: 2px solid #1c1c1c;
    background: #0f1012;

    .ant-modal-body {
      display: flex;
      flex-direction: column;
      padding: 0 0 18px;
      width: 100%;
      gap: 24px;

      .header {
        display: flex;
        flex: 1;
        padding-bottom: 18px;
        flex-direction: column;
        gap: 7px;
        font-family: Urbanist;

        .title {
          color: #fff;
          font-family: Urbanist;
          font-size: 32px;
          font-style: normal;
          font-weight: 800;
          line-height: 30px;
        }

        .desc {
          color: #8d8d8d;
          text-align: left;
          font-family: Urbanist;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
          line-height: 20px;
          margin-top: 12px;

          a {
            color: #fff;
            font-family: Urbanist;
            font-size: 14px;
            font-style: normal;
            font-weight: 600;
            line-height: 20px;
            text-decoration-line: underline;
          }
        }
      }
    }

    .block-view {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;

      .title {
        color: #fff;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        text-transform: capitalize;
      }

      .row {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        align-self: stretch;
        margin-top: 16px;

        .btn {
          display: flex;
          padding: 12px 51px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex: 1 0 0;
          border-radius: 22.5px;
          border: 2px #1c1c1c;
          box-shadow: 0px 0px 8px 0px #1c1c1c;

          color: var(--100, #fff);
          font-family: Quicksand;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%; /* 25.6px */
          cursor: pointer;

          .svg-icon {
            width: 39px;
            height: 24px;
          }

          img {
            width: 24px;
            height: 24px;
          }

          &:hover {
            background: #1c1c1c;
          }

          &:active {
            opacity: 0.5;
          }
        }

        .btn2 {
          border-radius: 80px;

          .svg-icon {
            width: 200px;
            height: 24px;
          }
        }
      }
    }
  }
}
</style>
