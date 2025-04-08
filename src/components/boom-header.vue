<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { usePointsStore } from '@/stores/points'
import { connectWallet, disconnectWallet } from '@/services/NftService'
import { onMounted } from 'vue'
import { CaretDownOutlined } from '@ant-design/icons-vue'
import type { Season } from '@/types/models'

const router = useRouter()
const walletStore = useWalletStore()
const global = useUserStore()
const pointsStore = usePointsStore()
const open = ref<boolean>(false)
const selectedSeasonId = ref()
const openProfile = ref<boolean>(false)
const profileType = ref<string>('email')
// const modalStore = useModalStore()
// const discordStore = useDiscordStore()

watch(
  () => pointsStore.currentSeason,
  (newVal) => {
    selectedSeasonId.value = newVal.id
  },
  { deep: true }
)

onMounted(() => {
  // 第一次进来，如果没有连接钱包，先连接钱包
  // connectWallet('meta') // 连接钱包，默认就是用metamask

  // 刷新页面，重新请求更新用户数据，(主要用于，Join Discord后，无法通知网站更新用户数据，所以允许用户手动刷新页面)
  global.fetchAccountInfo()
})

Promise.all([pointsStore.fetchSeasons(), pointsStore.getCurrentSeason()])

const showModal = () => {
  open.value = true
}

const clickLogin = () => {
  //   用户到网页（不管是否注册）直接提示链接钱包-->链接钱包后：
  // 1、没注册的，弹出欢迎弹窗，选择yes后，sign proof +自动拉起注册流程；
  // 1.1、增加分叉：1流程中选择no先浏览网站，则会在点击注册页面时先出欢迎弹窗+genesis proof+注册弹窗流程。
  // 2、已经注册的，链接钱包后不做任何弹窗
  // if (!walletStore.wallet.signedGenesisProof) {
  //   // 如果没有sign过，打开welcome modal，选择的是sign up模式
  //   modalStore.toggleWelcomeModal(true, false)
  // } else {
  //   // 如果signproof过了，提示注册
  //   showModal()
  // }
  showModal()
}

// 打开编辑个人资料
// type: setting | wallet(switch account)
const editProfile = (type: string) => {
  openProfile.value = true
  profileType.value = type
  console.log(type)
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const disconnectWalletClick = async (event: any) => {
  event.stopPropagation()
  console.log('Wallet Disconnected')
  disconnectWallet()
  global.clearAll()
}

const collectWallet = async () => {
  // 打开连接钱包的弹窗
  editProfile('wallet')
}

// 点击brand，跳转首页
const goHome = () => {
  router.push({ name: 'nft' })
}

const handleChange = (value: any) => {
  const selectedSeason = pointsStore.seasons?.find((item) => item.id === value)
  pointsStore.setCurrentSeason(selectedSeason as Season)
}

const isMenuShow = ref(false)
const openMenu = () => {
  isMenuShow.value = true
}
</script>
<template>
  <div class="header-pc header-wrapper">
    <div class="left">
      <div class="brand" @click="goHome">
        <svg-icon name="logo"></svg-icon>
        <div>GamerBoom</div>
      </div>
      <div class="line"></div>
      <div class="season">
        <a-select v-model:value="selectedSeasonId" @change="handleChange">
          <a-select-option v-for="item in pointsStore.seasons" :key="item.id" :value="item.id">
            <div class="item">{{ item.name }}</div>
            <div v-if="item.live" class="live">live</div>
            <div v-if="item.highlight" class="hot">HOT</div>
          </a-select-option>
          <template #suffixIcon><CaretDownOutlined :style="{ color: '#f4dca5' }" /></template>
        </a-select>
      </div>
    </div>

    <div class="actions">
      <div class="bg-wallet" v-if="!global.accessToken">
        <div class="collect-wallet" @click="clickLogin">
          <svg-icon name="wallet"></svg-icon>
          <div>LOG IN</div>
        </div>
      </div>
      <div v-else class="bg-wallet" :class="{ 'float-right': !!walletStore.wallet.address }">
        <a-dropdown
          overlayClassName="dropdown"
          placement="bottomRight"
          :arrow="{ pointAtCenter: true }"
        >
          <div class="collect-wallet">
            <svg-icon name="wallet"></svg-icon>
            <div v-if="walletStore.wallet.address">
              {{ formatAddress(walletStore.wallet.address) }}
            </div>
            <div v-else @click="collectWallet">Connect Wallet</div>
          </div>
          <template #overlay>
            <a-menu selectable>
              <a-menu-item class="account-wrapper" @click="editProfile('setting')">
                <boom-avatar
                  :src="global.account.avatar"
                  :username="global.account.name"
                  :size="38"
                />
                <div class="wrapper">
                  <div class="uid">{{ global.account.username }}</div>
                  <!-- 钱包地址 -->
                  <div v-if="walletStore.wallet.address" class="address">
                    {{ formatAddress(walletStore.wallet.address) }}
                  </div>

                  <!-- 网站昵称 -->
                  <div v-else-if="global.account.name" class="address">
                    {{ global.account.name }}
                  </div>

                  <!-- 社交媒体用户名 -->
                  <div
                    v-else-if="
                      global.account.discordVerified ||
                      global.account.twitterVerified ||
                      global.account.tgVerified
                    "
                    class="address"
                  >
                    {{
                      global.account.discordName ||
                      global.account.twitterName ||
                      global.account.tgName
                    }}
                  </div>
                  <!-- 邮箱 -->
                  <div v-else class="address">
                    {{ global.account.email }}
                  </div>
                </div>
                <svg-icon name="uid-edit" />
              </a-menu-item>
              <a-menu-item @click="editProfile('setting')"> Setting </a-menu-item>
              <a-menu-item @click="editProfile('wallet')"> Switch Account </a-menu-item>
              <a-menu-item @click="disconnectWalletClick"> Sign Out </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
    <div class="nav-menu" @click="openMenu">
      <svg-icon v-if="!isMenuShow" name="menu"></svg-icon>
      <svg-icon v-else name="close"></svg-icon>
    </div>
  </div>
  <login-entery v-model="open" />
  <modal-profile v-model="openProfile" :type="profileType" />
  <modal-menu v-model:open="isMenuShow"></modal-menu>
</template>

<style lang="scss" scoped>
.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .left {
    display: flex;
    align-items: center;
    gap: 15px;

    @media screen and (max-width: 600px) {
      flex-direction: column;
    }

    .brand {
      display: flex;
      align-items: center;
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

    .line {
      width: 2px;
      height: 25px;
      border-radius: 30px;
      background: rgba(#f3f3f3, 0.5);

      @media screen and (max-width: 600px) {
        display: none;
      }
    }
  }

  .actions {
    display: flex;

    .log-in,
    .discord-wrapper {
      border-radius: 48px;
      border-style: solid;
      border-color: #ffffff;
      border-width: 1px;
      display: flex;
      flex-direction: row;
      gap: 10px;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      min-width: 132px;
      height: 47px;
      padding: 0 24px;
      cursor: pointer;
    }

    .discord-wrapper {
      margin-right: 24px;
      border: 1px solid #5865f2;
      color: #5865f2;

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
      }
    }

    .account-wrapper {
      display: flex;
      align-items: center;
      width: 38px;
      height: 47px;
      // height: 100%;
      cursor: pointer;

      .svg-icon {
        width: 100%;
        height: 100%;
      }
    }

    .bg-wallet {
      display: flex;
      padding: 4px;
      margin-left: 24px;
      background: #0f1017;
      border-radius: 50px;
      width: 213px;
      height: 47px;

      .collect-wallet {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        background: #272b40;
        border-radius: 50px;
        border-width: 3px;
        font-weight: 700;
        width: 168px;
        height: 39px;
        cursor: pointer;

        div {
          flex: 1;
          text-align: center;
        }
      }

      .svg-icon {
        margin-right: 6px;
        width: 18px;
        height: 18px;
      }

      &.float-right {
        justify-content: flex-end;
        color: #00ffb4;
      }
    }
  }

  .nav-menu {
    display: none;
  }

  @media (max-width: 1280px) {
    .actions {
      display: none;
    }

    .nav-menu {
      display: flex;
      font-size: 24px;
      flex-shrink: 0;
    }
  }
}
</style>
<style lang="scss">
.ant-select {
  width: 320px;
  @media screen and (max-width: 600px) {
    width: calc(100% + 45px);
    // display: none;
  }
  @media screen and (max-width: 458px) {
    width: 100%;
  }
  &:not(.ant-select-customize-input) {
    .ant-select-selector {
      border-radius: 24px;
      border: 1px solid #f4dca5;
      background: #191a28;

      .ant-select-selection-item {
        color: #f4dca5;
      }
    }

    &:not(.ant-select-disabled):not(.ant-pagination-size-changer):hover .ant-select-selector {
      border-color: #f4dca5;
    }
  }
}

.ant-select-dropdown {
  background: #191a27;
  box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);

  .ant-select-item-option {
    &-content {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(#f4dca5, 0.5);

      .item {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .live {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 12px;
        flex-shrink: 0;
        border-radius: 2px;
        background: #00ffb4;
        font-size: 12px;
        color: #0f1017;
        text-align: center;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .hot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 12px;
        flex-shrink: 0;
        border-radius: 2px;
        background: #ff5487;
        font-size: 12px;
        color: #0f1017;
        text-align: center;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
      }
    }

    &-active:not(.ant-select-item-option-disabled) {
      background-color: transparent;
      .ant-select-item-option-content {
        color: rgba(#f4dca5, 0.7);
      }
    }

    &-selected:not(.ant-select-item-option-disabled) {
      background-color: transparent;
      .ant-select-item-option-content {
        color: #f4dca5;
      }
    }
  }
}

.ant-dropdown {
  .ant-dropdown-menu {
    .ant-dropdown-menu-item {
      padding: 16px 40px !important;

      .ant-dropdown-menu-title-content {
        color: var(--100, #fff);
        font-family: Quicksand;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 160%; /* 25.6px */
      }

      &.account-wrapper {
        .ant-dropdown-menu-title-content {
          display: flex;
          align-items: center;
          gap: 12px;
          align-self: stretch;
          flex: 1;

          .uid {
            color: #fff;
            font-family: Quicksand;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 160%; /* 25.6px */
          }

          .address {
            color: #00ffb4;
            font-family: Quicksand;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 160%;
          }
        }
      }
    }
  }
}
</style>
