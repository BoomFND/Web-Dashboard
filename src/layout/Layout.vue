<script lang="ts" setup>
import { gsap } from 'gsap'
import dayjs from 'dayjs'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useLoginTipStore } from '@/stores/tip'
import { useDownload } from '@/hooks/useDownload'
import type { CSSProperties } from 'ant-design-vue/es/_util/cssinjs/hooks/useStyleRegister'
import BindNewWallet from '@/components/uid/BindNewWallet.vue'
import { nextTick, onMounted, ref, watch } from 'vue'
import ModalProfile from '@/components/uid/ModalProfile.vue'
import { useRouter } from 'vue-router'
import { useModalStore, type ProfileType } from '@/stores/modal'

const collapsedWidth = ref<number>(80)
const unfoldWidth = ref<number>(212)
const asideStyle = ref<CSSProperties>({})

const router = useRouter()

const walletStore = useWalletStore()
const userStore = useUserStore()
const loginTipStore = useLoginTipStore()
const modalStore = useModalStore()

const isModalVisible = ref<boolean>(false) // 定义一个响应式变量控制模态框的显示
const isTaskModalVisible = ref<boolean>(false) // 定义一个响应式变量控制模态框的显示
const isBitlayerModalVisible = ref<boolean>(false) // 定义一个响应式变量控制模态框的显示

const showSwitchAddressModal = ref<boolean>(false)
const showConnectWalletModal = ref<boolean>(false)
const showBindWalletModal = ref<boolean>(false)
const collapsed = ref<boolean>(false)
const selectedKeys = ref<string[]>([])
const showEmailAddress = ref<boolean>(false)

// 添加控制邮箱提示弹框的状态
const showEmailBindModal = ref<boolean>(false)
const profileModalVisible = ref<boolean>(false)
const profileType = ref<ProfileType>('email')

watch(
  () => router.currentRoute.value.path,
  (newV) => {
    if (newV.includes('campaign')) {
      selectedKeys.value = ['campaign']
    } else {
      selectedKeys.value = [newV.slice(1)]
    }
  }
)

// 任务提示
const showTip = async () => {
  // 判断用户是否已登录
  if (!userStore.accessToken) return
  await loginTipStore.getTips()

  // 判断弹窗是否已经弹过，并且判断是否是当天弹的
  if (
    loginTipStore.remind[loginTipStore.type].finished &&
    loginTipStore.remind[loginTipStore.type].time === dayjs().format('YYYY-MM-DD')
  )
    return
  isTaskModalVisible.value = true
  // 设置已经提示过
  loginTipStore.setRemind()
}

const isSiderbarShow = ref<boolean>(window.innerWidth > 1350)
const handleResize = () => {
  if (window.innerWidth <= 1350) {
    collapsedWidth.value = 0
    collapsed.value = true
    asideStyle.value = {
      padding: '28px 0'
    }
  } else {
    collapsedWidth.value = 80
    collapsed.value = false
    asideStyle.value = {
      padding: '28px 16px'
    }
  }
}

const headerAnimation = () => {
  console.log('headerAnimation')
  gsap.fromTo(
    '.ant-layout-sider',
    {
      opacity: 0,
      x: -24
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power1.inOut'
    }
  )
}

onMounted(async () => {
  handleResize()
  await nextTick()
  isSiderbarShow.value && headerAnimation()
})

window.addEventListener('resize', handleResize)

const { handleDownload } = useDownload()
const download = () => {
  showEmailAddress.value = !!userStore.account.email
  if (showEmailAddress.value) {
    handleDownload() // 下载
    return
  }
  // 如果没有绑定邮箱，显示提示弹框
  showEmailBindModal.value = true
}

// 点击Skip按钮，直接下载
const handleSkipEmail = () => {
  showEmailBindModal.value = false
  handleDownload()
}

// 点击Bind Email按钮，跳转到邮箱绑定界面
const handleBindEmail = () => {
  showEmailBindModal.value = false
  profileModalVisible.value = true
  profileType.value = 'email'
}

const openWebsite = () => {
  window.open(import.meta.env.VITE_APP_WEB, '_blank')
}
</script>

<template>
  <a-layout>
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible :collapsedWidth="collapsedWidth"
      :width="unfoldWidth" :style="asideStyle">
      <div class="top-wrapper">
        <div class="logo-wrapper" :class="[!collapsed ? 'unfold' : 'fold']" @click="openWebsite">
          <SvgIcon v-if="!collapsed" name="aside-logo" />
          <SvgIcon v-else name="aside-logo-fold" />
        </div>
        <a-menu v-model:selectedKeys="selectedKeys" theme="light" mode="inline">
          <!-- <a-menu-item key="campaign" @click="$router.push('/campaign')">
            <template #icon>
              <SvgIcon name="aside-campaign" />
            </template>
<span>Campaign</span>
</a-menu-item> -->
          <a-menu-item key="quest" @click="$router.push('/quest')">
            <template #icon>
              <SvgIcon name="aside-quest" />
            </template>
            <span>Quest</span>
          </a-menu-item>
          <a-menu-item key="dashboard" @click="$router.push('/dashboard')">
            <template #icon>
              <SvgIcon name="aside-dashboard" />
            </template>
            <span>Mining</span>
          </a-menu-item>
          <a-menu-item key="leaderboard" @click="$router.push('/leaderboard')">
            <template #icon>
              <SvgIcon name="aside-leaderboard" />
            </template>
            <span>Leaderboard</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="bottom-wrapper">
        <div class="launch-button" :class="{ active: $route.name === 'launch', collapsed: collapsed }"
          @click="download">
          <SvgIcon name="aside-download" />
          <span>Download Now</span>
        </div>
        <div class="social" :class="{ collapsed: collapsed }">
          <a href="https://t.me/GamerBoom_Official" target="_blank" class="wrapper">
            <SvgIcon name="social-tg" />
          </a>
          <a href="https://x.com/Gamerboom_" target="_blank" class="wrapper">
            <SvgIcon name="social-x" />
          </a>
          <a href="https://discord.com/invite/gamerboom" target="_blank" class="wrapper">
            <SvgIcon name="social-discord" />
          </a>
        </div>
      </div>
    </a-layout-sider>
    <a-layout class="container" :style="{ paddingLeft: collapsed ? `${collapsedWidth}px` : `${unfoldWidth}px` }">
      <Header v-model="collapsed" :style="{
        width: collapsed ? `calc(100% - ${collapsedWidth}px)` : `calc(100% - ${unfoldWidth}px)`
      }" />
      <a-layout-content>
        <router-view />
      </a-layout-content>
      <Footer />
    </a-layout>
    <LoginEntry v-model="modalStore.isLoginEntryVisible" />
    <!-- <ModalBitlayer v-model="isBitlayerModalVisible" /> -->
    <SwitchAddress :model-value="showSwitchAddressModal" />
    <BindNewWallet :model-value="showBindWalletModal" />
    <ConnectWallet :model-value="showConnectWalletModal" />
    <!-- 邮箱绑定提示弹框 -->
    <a-modal v-model:open="showEmailBindModal" :footer="null" :closable="false" :maskClosable="false" :width="400"
      class="email-bind-modal">
      <div class="email-bind-content">
        <div class="email-bind-text">
          The client needs to log in with an email address. Please bind your email address first.
        </div>
        <div class="email-bind-buttons">
          <a-button class="skip-button" @click="handleSkipEmail">Skip</a-button>
          <a-button type="primary" class="bind-button" @click="handleBindEmail">Bind Email</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 邮箱绑定页面 -->
    <ModalProfile v-model="profileModalVisible" :type="profileType" />
  </a-layout>
</template>

<style lang="scss" scoped>
.ant-layout {
  min-height: 100vh;
  overflow: hidden;

  .ant-layout-sider {
    display: flex;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    height: 100vh;
    padding: 28px 16px;
    background: #fff;
    overflow: 'auto';

    .logo-wrapper {
      display: flex;
      padding: 0px var(--8, 8px) var(--28, 28px) var(--8, 8px);
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      cursor: pointer;

      &.unfold .svg-icon {
        width: 148.004px;
        height: 20px;
      }

      &.fold {
        align-items: center;

        .svg-icon {
          width: 24px;
          height: 24px;
        }
      }
    }

    .ant-menu {
      border: none;
    }

    :deep(.ant-menu-item) {
      display: flex;
      padding: 12px !important;
      align-items: center;
      align-content: center;
      // gap: 12px;
      border-radius: 80px;
      margin-block: 0;
      margin-inline: 0;
      margin-top: 20px;
      width: 100%;
      height: 48px;
      line-height: 48px;

      color: #6e6e73;
      font-size: var(--Font-size-14, 14px);
      font-style: normal;

      span {
        font-weight: 500;
        line-height: 24px;
        letter-spacing: var(--Letter-spacing-Letter-spacing, 0px);
      }

      .ant-menu-item-icon {
        width: 24px;
        height: 24px;
        font-size: 24px;
        line-height: 48px;
        flex-shrink: 0;
      }

      .ant-menu-title-content {
        margin-inline-start: 12px;
      }

      &:not(.ant-menu-item-selected):hover,
      &:not(.ant-menu-item-selected):active {
        color: #6e6e73;
        font-weight: 500;
        background: var(--color-background);
      }

      &.ant-menu-item-selected {
        background: var(--color-background);
        color: var(--color-primary);

        span {
          font-weight: 700;
        }
      }
    }

    :deep(.ant-menu-inline-collapsed .ant-menu-item) {
      width: 48px;
    }

    :deep(.ant-layout-sider-children) {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .bottom-wrapper {
        display: flex;
        flex-direction: column;
        gap: 64px;
      }

      .launch-button {
        position: relative;
        display: flex;
        padding: 12px;
        justify-content: center;
        align-items: center;
        align-content: center;
        border-radius: 80px;
        border: 1.5px solid var(--color-primary);
        height: 48px;
        line-height: 48px;
        font-size: var(--Font-size-14, 14px);
        font-style: normal;
        color: var(--color-primary);
        will-change: width, border-color, padding;
        transition:
          border-color 0.3s,
          width 0.2s cubic-bezier(0.645, 0.045, 0.355, 1),
          padding 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        cursor: pointer;
        overflow: hidden;

        span {
          margin-inline-start: 12px;
          white-space: nowrap;
          opacity: 1;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: 111.111%;
          letter-spacing: 0px;
          flex: auto;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          will-change: opacity, color;
          transition:
            opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
            color 0.3s;
        }

        .svg-icon {
          display: block;
          margin-left: 2px;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        &:hover,
        &.active {
          background: var(--color-primary);
          color: #fff;
        }

        &:active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 80px;
          background: rgba(29, 29, 31, 0.16);
        }

        &.collapsed {
          span {
            opacity: 0;
          }

          width: 48px;
          overflow: hidden;
        }
      }

      .social {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;

        .svg-icon {
          width: 24px;
          height: 24px;
          font-size: 24px;
          color: #6e6e73;

          &:hover {
            cursor: pointer;
            color: var(--color-primary);
          }
        }

        &.collapsed {
          flex-direction: column;
          gap: 42px;
        }
      }
    }
  }

  .container {
    padding-top: 86px;
    will-change: padding;
    transition: padding 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

    .header {
      position: fixed;
      top: 0;
      z-index: 9;
      will-change: width;
      transition: width 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    .ant-layout-content {
      min-height: calc(100vh - 128px);
      overflow: auto;
    }
  }
}

@media screen and (min-width: 1921px) {
  .ant-layout {
    .container {
      padding-top: calc(86 * 100vw / 1920);

      .ant-layout-content {
        min-height: calc(100vh - calc(128 * 100vw / 1920));
      }
    }
  }
}

@media screen and (max-width: 1280px) {
  .ant-layout {
    .ant-layout-sider {
      display: none;
    }

    .container {
      transition: none;

      .header {
        transition: none;
      }
    }
  }
}

@media screen and (max-width: 834px) {
  .ant-layout {
    .container {
      padding-top: 210px;

      .ant-layout-content {
        min-height: calc(100vh - 252px);
      }
    }
  }
}

/* 邮箱绑定弹框样式 */
:global(.email-bind-modal .ant-modal-content) {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
}

.email-bind-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  .email-bind-text {
    color: #1d1d1f;
    text-align: center;
    font-family: Urbanist;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .email-bind-buttons {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 16px;

    .skip-button,
    .bind-button {
      flex: 1;
      height: 40px;
      border-radius: 20px;
      font-family: Urbanist;
      font-size: 14px;
      font-weight: 700;
    }

    .skip-button {
      border: 1px solid #e5e5e5;
      color: #6e6e73;

      &:hover {
        border-color: #d1d1d6;
        color: #1d1d1f;
      }
    }

    .bind-button {
      background: var(--color-primary);
      border: none;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>