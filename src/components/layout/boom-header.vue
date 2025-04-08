<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
// import { useDiscordStore } from '@/stores/discord'
import { disconnectWallet } from '@/services/NftService'
// import { useModalStore } from '@/stores/modal'
import { onMounted } from 'vue'

const router = useRouter()
const walletStore = useWalletStore()
const global = useUserStore()
const open = ref<boolean>(false)
const openProfile = ref<boolean>(false)
const profileType = ref<string>('email')
// const modalStore = useModalStore()
// const discordStore = useDiscordStore()

onMounted(() => {
  // 第一次进来，如果没有连接钱包，先连接钱包
  // connectWallet('meta') // 连接钱包，默认就是用metamask

  // 刷新页面，重新请求更新用户数据，(主要用于，Join Discord后，无法通知网站更新用户数据，所以允许用户手动刷新页面)
  global.fetchAccountInfo()
})

const showModal = () => {
  open.value = true
}

const clickLogin = () => {
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
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
}

const formatName = (name: string) => {
  return name.length > 10 ? `${name.slice(0, 10)}...` : name
}

const disconnectWalletClick = async (event: any) => {
  event.stopPropagation()
  console.log('Wallet Disconnected')
  disconnectWallet()
}

const collectWallet = async () => {
  // 打开连接钱包的弹窗
  editProfile('wallet')
}
const defaultColor = ref('#8D8D8D')
const hoverColor = ref('#FFFFFF')
const hoverBtn = ref('')
</script>
<template>
  <div class="header-wrapper">
    <div class="brand"></div>
    <div class="actions">
      <div class="bg-wallet bg-wallet-no-login" v-if="!global.accessToken">
        <div class="collect-wallet" @click="clickLogin">
          <svg-icon name="account-login"></svg-icon>
          <div>Login Now</div>
        </div>
      </div>
      <div v-else class="bg-wallet" :class="{ 'float-right': !!walletStore.wallet.address }">
        <a-dropdown
          overlayClassName="dropdown"
          placement="bottomRight"
          :arrow="{ pointAtCenter: true }"
        >
          <div class="collect-wallet">
            <img v-if="global.account.avatarUrl" :src="global.account.avatarUrl" />
            <img v-else src="@/assets/images/account/avatar.png" />
            <div v-if="walletStore.wallet.address">
              {{ formatAddress(walletStore.wallet.address) }}
            </div>
            <div v-else>{{ formatName(global.account.name) }}</div>
            <svg-icon name="account-arrow"></svg-icon>
          </div>
          <template #overlay>
            <a-menu selectable>
              <a-menu-item @click="editProfile('setting')" @mouseover="hoverBtn='setting'" @mouseleave="hoverBtn=''">
                <svg-icon name="account-setting" :color="hoverBtn==='setting' ? hoverColor : defaultColor"></svg-icon>
                Setting
              </a-menu-item>
              <a-menu-item @click="editProfile('wallet')" @mouseover="hoverBtn='switch'" @mouseleave="hoverBtn=''">
                <svg-icon name="account-switch" :color="hoverBtn==='switch' ? hoverColor : defaultColor"></svg-icon>
                Switch Account
              </a-menu-item>
              <a-menu-item @click="global.clearAll()" @mouseover="hoverBtn='disconnect'" @mouseleave="hoverBtn=''">
                <svg-icon name="account-disconnect" :color="hoverBtn==='disconnect' ? hoverColor : defaultColor"></svg-icon>
                Disconnect
              </a-menu-item>
              <div class="split-line"> </div>
              <a-menu-item @click="editProfile('setting')">
                <div>
                  <div>UID</div>
                  <div class="uid">{{ global.account.username }}</div>
                </div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
  <login-entery v-model="open" />
  <modal-profile v-model="openProfile" :type="profileType" />
</template>

<style lang="scss" scoped>
.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

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
      padding: 8px;
      margin-left: 24px;
      border: 2px #1C1C1C;
      background: #0F1012;
      box-shadow: 0px 0px 8px 0px #1C1C1C;
      border-radius: 50px;
      width: 182px;
      height: 46px;
      flex-shrink: 0;
      margin-right: 60px;

      .collect-wallet {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #FFF;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        cursor: pointer;
        width: 100%;

        img {
          width: 30px;
          height: 30px;
          border-radius: 30px;
          margin-right: 12px;
        }

        div {
          flex: 1;
          text-align: center;
          margin-right: 5px;
          width: 95px;
        }
      }

      .svg-icon {
        margin-right: 5px;
        width: 10.8px;
        height: 9.7px;
      }

      &.float-right {
        justify-content: flex-end;
        color: #00ffb4;
      }
    }

    .bg-wallet-no-login {
      padding: 16px 24px;
      align-items: flex-start;
      gap: 8px;
      border-radius: 43px;
      border: 2px #1C1C1C;
      background: #0F1012;
      box-shadow: 0px 0px 8px 0px #1C1C1C;
      width: 137px;
      height: 53px;
      margin-right: 60px;

      .collect-wallet {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #272b40;
        cursor: pointer;
        background: none;
        padding: 0;
        color: #FFF;
        font-family: Urbanist;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        border: none;
        border-radius: 0;
        width: 89px;
        height: 21px;

        div {
          flex: 1;
          text-align: center;
          margin-right: 0;
        }
      }

      .svg-icon {
        margin-right: 6px;
        width: 15px;
        height: 21px;
      }
    }
  }
}
</style>
<style lang="scss">
.ant-dropdown {
  .ant-dropdown-menu {
    display: flex;
    width: 267px;
    padding: 16px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    border-radius: 24px;
    border: 2px solid #1C1C1C;
    background: #0F1012;
    box-shadow: 0px 0px 8px 0px #1C1C1C;

    .svg-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }

    .split-line {
      width: 243px;
      height: 2px;
      background: #1C1C1C;
    }

    .ant-dropdown-menu-item {
      display: flex;
      height: 40px;
      padding: 0px 12px;
      align-items: center;
      align-self: stretch;
      border-bottom: none;

      &:hover {
        background: #090C0F;

        .ant-dropdown-menu-title-content {
          color: #FFFFFF;
        }
      }

      .ant-dropdown-menu-title-content {
        color: #8D8D8D;
        font-family: Urbanist;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        border-radius: 12px;
      }

      .uid {
        color: #FFF;
        font-family: Urbanist;
        font-size: 12px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
      }
    }

    .ant-dropdown-menu-item-selected {
      background: none;
    }
  }
}
</style>
