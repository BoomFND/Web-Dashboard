<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { connectWallet, disconnectWallet } from '@/services/NftService'
import type { NavMenu } from '@/types/models'
import { useDownload } from '@/hooks/useDownload'

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const global = useUserStore()
const walletStore = useWalletStore()

const emit = defineEmits(['update:open'])

const onClose = () => {
  //   open.value = false
  emit('update:open', false)
}

// 点击brand，跳转首页
const goHome = () => {
  onClose()
  const router = useRouter()
  router.push({ name: 'nft' })
}

const openLoginModal = ref<boolean>(false)

const showModal = () => {
  openLoginModal.value = true
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const disconnectWalletClick = async (event: any) => {
  event.stopPropagation()
  console.log('Wallet Disconnected')
  disconnectWallet()
}

onMounted(() => {
  // 第一次进来，如果没有连接钱包，先连接钱包
  // connectWallet('meta') // 连接钱包，默认就是用metamask

  // 刷新页面，重新请求更新用户数据，(主要用于，Join Discord后，无法通知网站更新用户数据，所以允许用户手动刷新页面)
  global.fetchAccountInfo()
})

const route = useRoute()
const router = useRouter()

const currentRouteName = ref()
watch(
  () => route.name,
  (name) => {
    currentRouteName.value = name
  }
)

const navItems = ref<NavMenu[]>([
  {
    title: 'Campaign',
    icon: 'nft',
    path: 'nft'
  },
  {
    title: 'Social Tasks',
    icon: 'quest',
    path: 'quest'
  },
  {
    title: 'Mini Game',
    icon: 'vector',
    path: 'miniGame'
  },

  {
    title: 'Dashboard',
    icon: 'home',
    path: 'dashboard'
  },
  {
    title: 'Leaderboard',
    icon: 'rank',
    path: 'leaderboard'
  },
  {
    title: 'Home',
    icon: 'net',
    path: 'net'
  },
  {
    title: 'Download',
    icon: 'download',
    path: 'download'
  }
])

const handleClick = (item: NavMenu) => {
  onClose()
  currentRouteName.value = item.path

  if (item.path === 'net') {
    return window.open('https://www.gamerboom.org/', '_black')
  }

  if (item.path === 'download') {
    const { handleDownload } = useDownload()
    return handleDownload()
  }
  router.push({ name: item.path })
}
// 点击dropdown选项
const connectWalletClick = () => {
  connectWallet('meta')
}
</script>

<template>
  <a-drawer
    height="100%"
    placement="top"
    :closable="false"
    :open="open"
    @close="onClose"
    :bodyStyle="{ background: '#14151f', padding: 0 }"
  >
    <div class="drawer__wrapper">
      <div class="drawer__header">
        <div class="drawer__header-brand" @click="goHome">
          <svg-icon name="logo"></svg-icon>
          <div>GamerBoom</div>
        </div>
        <div class="drawer__header-close" @click="onClose">
          <svg-icon name="close"></svg-icon>
        </div>
      </div>
      <div class="drawer__content">
        <div class="drawer__content-menu">
          <div
            class="drawer__content-menu-item"
            :class="[item.icon, currentRouteName === item.path ? 'active' : '']"
            v-for="item in navItems"
            :key="item.icon"
            @click="handleClick(item)"
          >
            <svg-icon :name="item.icon" />
            <div class="text">{{ item.title }}</div>
          </div>
        </div>
      </div>
      <div class="drawer__footer">
        <div v-if="!global.account.username" class="drawer__footer-item login" @click="showModal">
          LOG IN
        </div>

        <template v-else>
          <div
            class="drawer__footer-item wallet"
            :class="{ address: !!walletStore.wallet.address }"
            v-if="walletStore.wallet.address"
            @click="disconnectWalletClick"
          >
            <svg-icon name="wallet"></svg-icon>
            <div>
              {{ formatAddress(walletStore.wallet.address) }}
            </div>
          </div>

          <div
            v-else
            class="drawer__footer-item wallet"
            :class="{ address: !!walletStore.wallet.address }"
            @click="connectWalletClick"
          >
            <svg-icon name="wallet"></svg-icon>
            <div>Connect Wallet</div>
          </div>
        </template>
      </div>
    </div>
    <login-entery v-model="openLoginModal" />
  </a-drawer>
</template>

<style lang="scss" scoped>
.drawer {
  &__wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 768px;
      background-repeat: no-repeat;
      background-size: 100%;
      background-size: cover;
    }

    &::before {
      height: 481.6px;
      background-image: url('@/assets/images/bg_header.png');
    }

    &::after {
      left: 0;
      bottom: 0;
      height: 358.4px;
      background-image: url('@/assets/images/bg_footer.png');
    }
  }

  &__header {
    display: flex;
    height: 94px;
    padding: 10px 0 10px 32px;
    justify-content: space-between;
    align-items: center;

    &-brand {
      display: flex;
      align-items: center;
      height: 100%;
      font-size: 18px;
      color: #f3f3f3;
      font-size: 19.379px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-transform: capitalize;
      cursor: pointer;
      .svg-icon {
        margin-right: 8px;
      }
    }

    &-close {
      display: flex;
      align-items: center;
      padding: 0 32px;
      height: 100%;
      cursor: pointer;
      font-size: 24px;
      &:focus-visible {
        outline: none;
      }
    }
  }

  &__content {
    padding: 0 32px;
    flex: 1;

    &-menu {
      display: flex;
      flex-direction: column;

      &-item {
        display: flex;
        height: 57px;
        padding: 16px 0 0px 0;

        display: flex;
        align-items: center;
        gap: 12px;
        align-self: stretch;
        box-sizing: border-box;

        color: var(--40, rgba(255, 255, 255, 0.4));
        font-family: Quicksand;
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: 16px; /* 114.286% */
        border-bottom: 1px solid var(--2, rgba(255, 255, 255, 0.02));
        cursor: pointer;

        .svg-icon {
          font-size: 28px;
        }

        .text {
          line-height: 16px;
        }

        &:hover {
          opacity: 0.6;
        }

        &:visited {
          opacity: 0.8;
        }

        &:active,
        &.active {
          opacity: 1;

          &.nft {
            color: #00ffb4;
          }

          &.quest {
            color: #10e4f4;
          }

          &.home {
            color: #ffca47;
          }

          &.rank {
            color: #ca59ff;
          }

          &.net {
            color: #fff;
          }

          &.download {
            color: #8faadc;
          }
        }
      }
    }
  }

  &__footer {
    display: flex;
    width: 100%;
    padding: 32px 32px 48px 32px;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &-item {
      display: flex;
      height: 48px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      align-self: stretch;
      color: var(--100, #fff);
      border-radius: 48px;
      padding: 0 24px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;

      &.discord {
        color: #5865f2;
        border: 1px solid #5865f2;

        .svg-icon {
          font-size: 20px;
        }

        &:not(.disabled):hover {
          opacity: 0.8;
        }

        &:not(.disabled):active {
          opacity: 0.5;
        }

        &.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }

      &.login {
        flex-direction: column;
        border: 1px solid var(--100, #fff);

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.5;
        }
      }

      &.wallet {
        margin-top: 24px;
        justify-content: center;
        gap: 8px;
        background: #272b40;
      }

      &.address {
        color: #00ffb4;
      }

      &:not(:first-child) {
        margin-top: 24px;
      }
    }
  }

  &__header,
  &__content,
  &__footer {
    position: relative;
    z-index: 1;
  }
}
</style>
<style>
.cell-list {
  .cell {
    display: flex;
    padding: 12px 70px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    align-self: stretch;
    border-bottom: 1px solid rgba(39, 43, 64, 0.8);

    font-size: 14px;
    color: #fff;
    font-weight: 700;
    text-transform: capitalize;
    cursor: pointer;

    &:hover {
      background-color: rgba(39, 43, 64, 0.8);
    }
  }
  .image-wrapper {
    margin-right: 8px;
    width: 24px;
    height: 24px;
    object-position: center;
    object-fit: cover;
    overflow: hidden;
    border-radius: 5.426px;
    border: 0.5px solid rgba(255, 255, 255, 0.24);
    backdrop-filter: blur(12px);

    img {
      width: 100%;
      height: 100%;
      object-position: center;
      object-fit: cover;
    }
  }
}
</style>
