<script lang="ts" setup>
import { connectWallet, disconnectWallet } from '@/services/NftService'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'
import { useTelegramStore } from '@/stores/telegram'
import { putAccount } from '@/apis/index'
import { notification } from 'ant-design-vue'
import SvgIcon from '@/components/svg-icon.vue'
import type { Rule } from 'ant-design-vue/es/form'
import { bindEmail, sendBindEmailCode } from '@/apis/uid'
import { message } from 'ant-design-vue'

// 定义双向绑定的modelValue
interface Props {
  modelValue: boolean
  type: string
}
const props = defineProps<Props>()

// 通过watch监听modelValue，实现数据的修改
const showModal = ref(false)
const profileType = ref(props.type)

watch(
  () => props.modelValue,
  (newV) => {
    showModal.value = newV

    // 当当前弹窗被打开时，同步当前弹窗页面信息
    if (newV) {
      // 处理profile settings
      profile.avatar = userStore.account.avatarUrl
      profile.name = userStore.account.name

      // 处理 Wallet address
      showWalletAddress.value = !!walletStore.wallet.address

      // 处理 Email address
      showEmailAddress.value = !!userStore.account.email
    }
  }
)

watch(
  () => props.type,
  (newV) => {
    profileType.value = newV
  }
)

const userStore = useUserStore()
const walletStore = useWalletStore()

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  emit('update:modelValue', false)
}

const open = ref<boolean>(false)

////////////profile setting START//////////////////

const toggleProfileType = (type: string) => {
  profileType.value = type
}

const profile = reactive({
  name: userStore.account.name,
  avatar: userStore.account.avatarUrl
})

const handleChange = async (file: string) => {
  profile.avatar = file
}

const { setAccount, setAvatarColor, fetchAccountInfo } = useUserStore()
const onSubmit = async () => {
  try {
    if (!profile.name) {
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
            'Please Enter User Name!'
          ),
        closeIcon: () =>
          h(SvgIcon, {
            name: 'close',
            style: { width: '24px', height: '24px', marginTop: '20px' }
          }),
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
      return
    }
    const res: any = await putAccount(toRaw(profile))
    setAccount(res)
    // 没有上传头像，则设置一下头像颜色
    !profile.avatar && setAvatarColor()
    emit('update:modelValue', false)
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
          'Save User Info successfully!'
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
  } catch (error) {
    console.error(error)
  }
}
////////////profile setting END//////////////////

////////////Wallet Address START//////////////////
const showWalletAddress = ref(!!walletStore.wallet.address)

// 如果有变动，则直接修改showWalletAddress的值
watch(
  () => walletStore.wallet.address,
  (newV) => {
    showWalletAddress.value = !!newV
  }
)

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 切换钱包登录页面
const switchWalletAddress = () => {
  // 退出钱包
  disconnectWallet()
  // 切换登录钱包页面
  showWalletAddress.value = false
}

const handleWalletConnect = (type: string) => {
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
////////////Wallet Address END//////////////////

////////////email登录注册 START//////////////////
const showEmailAddress = ref(!!userStore.account.email)

// 表单属性
const modelRef = reactive({
  email: '',
  confirmCode: ''
})

// 自定义email验证
const validateEmail = async () => {
  if (
    !modelRef.email ||
    !/^[\w\u2E80-\u9FFF.-]+@[\da-z.-]+\.([a-z]{2,6}|[\u2E80-\u9FFF]{2,3})$/.test(modelRef.email)
  ) {
    return Promise.reject('Please input the correct email address')
  }
  return Promise.resolve()
}

// 自定义email验证
const validateCode = async () => {
  if (!modelRef.confirmCode || !/\d{6}/.test(modelRef.confirmCode)) {
    return Promise.reject('Please input the correct verification code')
  }
  return Promise.resolve()
}

// 校验规则
const rules: Record<string, Rule[]> = {
  email: [
    {
      required: true,
      validator: validateEmail,
      trigger: 'blur'
    }
  ],
  confirmCode: [
    {
      required: true,
      validator: validateCode,
      trigger: 'blur'
    }
  ]
}

// 倒计时
const countdown = ref(0)

/**
 * 开始倒计时
 */
const timer2 = ref()
const start = () => {
  countdown.value = 60
  timer2.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer2.value)
    }
  }, 1000)
}

// 发送邮件，获取验证码
const handleSendCode = async () => {
  try {
    if (
      !modelRef.email ||
      !/^[\w\u2E80-\u9FFF.-]+@[\da-z.-]+\.([a-z]{2,6}|[\u2E80-\u9FFF]{2,3})$/.test(modelRef.email)
    )
      return
    start()
    const res = await sendBindEmailCode(modelRef.email)
    console.log(res)
  } catch (error: any) {
    console.error(error)
    message.error(error.detail, 5)
  }
}

const formRef = ref()
// 提交表单
const handleEmailBind = () => {
  formRef.value
    .validate()
    .then(async () => {
      const res = await bindEmail({ ...toRaw(modelRef) })
      console.log(res)

      // 设置account
      // 请求用户信息
      fetchAccountInfo()

      // 切换成email address展示页面
      showEmailAddress.value = true
    })
    .catch((err: any) => {
      console.log('error', err)
      if (err.email && Array.isArray(err.email)) {
        message.error(err.email[0], 5)
      } else if (err.detail) {
        message.error(err.detail, 5)
      }
    })
}

const showSignIn = ref(false)
const openLogin = () => {
  handleClose()
  showSignIn.value = true
}

// 处理Login moadal 返回操作，打开register modal
const handleBack = () => {
  emit('update:modelValue', true)
}

////////////email登录注册 END//////////////////

////////////SOCIAL认证 START//////////////////
const discordStore = useDiscordStore()
const twitterStore = useTwitterStore()
const telegramStore = useTelegramStore()

const handleSocialBind = async (type: string) => {
  switch (type) {
    case 'telegram':
      // 如果已认证，则不做处理
      if (userStore.account.tgVerified) return
      // 否则，去认证
      // 设置是认证
      sessionStorage.setItem('telegramType', 'verify')
      try {
        const { userId, username, first_name, last_name }: any = await telegramStore.fetchUrl()
        telegramStore.telegramAuthorization(userId, username, first_name + ' ' + last_name, true)
      } catch (error) {
        console.error(error)
      }
      break
    case 'discord':
      console.log('discord')
      // 如果已认证，则不做处理
      if (userStore.account.discordVerified) return
      // 否则，去认证
      // 设置是认证
      sessionStorage.setItem('discordType', 'verify')
      discordStore.fetchUrl()
      break
    case 'twitter':
      console.log('twitter')
      if (userStore.account.twitterVerified) return
      // 设置是认证
      sessionStorage.setItem('twitterType', 'verify')
      twitterStore.fetchUrl()
      // connectWallet(type)
      break
  }
}
////////////SOCIAL认证 END//////////////////

const defaultColor = ref('#8D8D8D')
const hoverColor = ref('#FFFFFF')
const hoverBtn = ref('')
const focusEmail = ref(false)
const focusCode = ref(false)
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
      <div class="title">Edit Profile</div>
      <div class="desc">
        By logging in to GameBoom, you agree to
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
    <div class="profile-wrapper">
      <div class="left">
        <div
          class="item"
          :class="{ active: profileType === 'setting' }"
          @click="toggleProfileType('setting')"
          @mouseover="hoverBtn = 'setting'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon
            name="account-setting"
            :color="hoverBtn === 'setting' || profileType === 'setting' ? hoverColor : defaultColor"
          />
          Profile Setting
        </div>
        <div
          class="item"
          :class="{ active: profileType === 'wallet' }"
          @click="toggleProfileType('wallet')"
          @mouseover="hoverBtn = 'wallet'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon
            name="account-wallet"
            :color="hoverBtn === 'wallet' || profileType === 'wallet' ? hoverColor : defaultColor"
          />
          Wallet Address
        </div>
        <div
          class="item"
          :class="{ active: profileType === 'email' }"
          @click="toggleProfileType('email')"
          @mouseover="hoverBtn = 'email'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon
            name="account-email"
            :color="hoverBtn === 'email' || profileType === 'email' ? hoverColor : defaultColor"
          />
          Email Address
        </div>
        <div
          class="item"
          :class="{ active: profileType === 'social' }"
          @click="toggleProfileType('social')"
          @mouseover="hoverBtn = 'social'"
          @mouseleave="hoverBtn = ''"
        >
          <SvgIcon
            name="account-social"
            :color="hoverBtn === 'social' || profileType === 'social' ? hoverColor : defaultColor"
          />
          Social Account
        </div>
      </div>
      <div class="right">
        <template v-if="profileType === 'setting'">
          <div class="image">
            <div class="title">Profile Image</div>
            <div class="desc">
              We recommend an image of at least 300x300. GIFs work too. Max 5mb.
            </div>
          </div>
          <div class="image-wrapper">
            <img class="avatar" v-if="profile.avatar" :src="profile.avatar" />
            <img class="avatar" v-else src="@/assets/images/account/profile_avatar.png" />
            <div class="upload-icon">
              <SvgIcon name="account-upload" />
            </div>
            <boom-upload
              class="avatar-upload"
              v-model:avatar="profile.avatar"
              @change="handleChange"
            ></boom-upload>
          </div>
          <div class="profile">
            <div class="user-id">
              <div class="label">User ID</div>
              <div class="value">{{ userStore.account.username }}</div>
            </div>
            <div class="user-name">
              <div class="label">User Name</div>
              <div class="tip">Changes are allowed every 1 month</div>
              <a-input
                v-model:value="profile.name"
                placeholder="Enter your User Name"
                autocomplete="off"
              />
            </div>
          </div>
          <div class="action">
            <a-button class="button-create" shape="round" ghost @click="onSubmit">Save</a-button>
          </div>
        </template>

        <template v-if="profileType === 'wallet' && !showWalletAddress">
          <div class="wallet-login-wrapper">
            <div class="title">Connect Wallet</div>
            <div class="row">
              <div
                class="btn"
                @click="handleWalletConnect('meta')"
                @mouseover="hoverBtn = 'metamask'"
                @mouseleave="hoverBtn = ''"
              >
                <SvgIcon v-if="hoverBtn == 'metamask'" name="wallet-metamask_hover" />
                <SvgIcon v-else name="wallet-metamask" />
              </div>
              <div
                class="btn"
                @click="handleWalletConnect('okx')"
                @mouseover="hoverBtn = 'okx'"
                @mouseleave="hoverBtn = ''"
              >
                <SvgIcon v-if="hoverBtn == 'okx'" name="wallet-okx_hover" />
                <SvgIcon v-else name="wallet-okx" />
              </div>
            </div>
            <div class="row">
              <div
                class="btn"
                @click="handleWalletConnect('math')"
                @mouseover="hoverBtn = 'math_wallet'"
                @mouseleave="hoverBtn = ''"
              >
                <SvgIcon v-if="hoverBtn == 'math_wallet'" name="wallet-math_wallet_hover" />
                <SvgIcon v-else name="wallet-math_wallet" />
              </div>
              <div
                class="btn"
                @click="handleWalletConnect('coinbase')"
                @mouseover="hoverBtn = 'coinbase'"
                @mouseleave="hoverBtn = ''"
              >
                <SvgIcon v-if="hoverBtn == 'coinbase'" name="wallet-coinbase_hover" />
                <SvgIcon v-else name="wallet-coinbase" />
              </div>
            </div>
          </div>
        </template>
        <template v-if="profileType === 'wallet' && showWalletAddress">
          <div class="wallet-wrapper">
            <div class="label">Wallet Address</div>
            <div class="value" v-if="walletStore.wallet.address">
              {{ walletStore.wallet.address }}
            </div>
          </div>
          <div class="action">
            <a-button class="button-create" shape="round" ghost @click="switchWalletAddress">
              Switch Account
            </a-button>
          </div>
        </template>
        <template v-if="profileType === 'email' && !showEmailAddress">
          <div class="email-wrapper">
            <div class="title">Create Your Email Account</div>
            <a-form ref="formRef" layout="vertical" :rules="rules" :model="modelRef">
              <a-form-item name="email">
                <a-input
                  v-model:value="modelRef.email"
                  placeholder="Your Email Address"
                  autocomplete="off"
                  @focus="focusEmail = true"
                  @blur="focusEmail = false"
                >
                  <template #prefix>
                    <SvgIcon
                      name="account-email"
                      class="margin-left-24"
                      :color="focusEmail ? '#FFFFFF' : '#8D8D8D'"
                    />
                  </template>
                  <template #suffix>
                    <a-button
                      class="button-send"
                      type="link"
                      :disabled="countdown > 0"
                      @click="handleSendCode"
                      :class="focusEmail ? 'color-white' : 'color-gray'"
                    >
                      {{ countdown ? `Resend  Email（${countdown}）` : 'Sent a code' }}
                    </a-button>
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item name="confirmCode">
                <a-input
                  v-model:value="modelRef.confirmCode"
                  placeholder="Verification Code"
                  autocomplete="off"
                  @focus="focusCode = true"
                  @blur="focusCode = false"
                >
                  <template #prefix>
                    <SvgIcon
                      name="account-verify_code"
                      class="margin-left-24"
                      :color="focusCode ? '#FFFFFF' : '#8D8D8D'"
                    />
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item class="margin-top-40">
                <a-button class="button-create" shape="round" ghost @click="handleEmailBind"
                  >Next</a-button
                >
              </a-form-item>
              <a-form-item style="text-align: center">
                <span class="text">Already a member?</span>
                <a-button class="link" type="link" @click="openLogin">Sign in</a-button>
              </a-form-item>
            </a-form>
          </div>
        </template>

        <template v-if="profileType === 'email' && showEmailAddress">
          <div class="email-address-wrapper">
            <div class="label">Email Address</div>
            <div class="value" v-if="userStore.account.email">
              {{ userStore.account.email }}
            </div>
          </div>
        </template>

        <template v-if="profileType === 'social'">
          <div class="social-address-wrapper">
            <div class="title">Link Your Social TAGS</div>
            <div class="actions">
              <div class="btn" @click="handleSocialBind('twitter')">
                <div class="text-wrapper">
                  <SvgIcon
                    name="uid-twitter"
                    :color="userStore.account.twitterVerified ? '#FFFFFF' : '#8D8D8D'"
                  />
                </div>
                <div class="reward-wrapper" v-if="userStore.account.twitterVerified">
                  {{ userStore.account.twitterName }}
                </div>
                <div class="no-reward-wrapper" v-else>associate</div>
              </div>
              <div class="btn" @click="handleSocialBind('telegram')">
                <div class="text-wrapper">
                  <SvgIcon
                    name="uid-telegram"
                    :color="userStore.account.tgVerified ? '#FFFFFF' : '#8D8D8D'"
                  />
                </div>
                <div class="reward-wrapper" v-if="userStore.account.tgVerified">
                  {{ userStore.account.tgName }}
                </div>
                <div class="no-reward-wrapper" v-else>associate</div>
              </div>
              <div class="btn" @click="handleSocialBind('discord')">
                <div class="text-wrapper">
                  <SvgIcon
                    name="uid-discord"
                    :color="userStore.account.discordVerified ? '#FFFFFF' : '#8D8D8D'"
                  />
                </div>

                <div class="reward-wrapper" v-if="userStore.account.discordVerified">
                  {{ userStore.account.discordName }}
                </div>
                <div class="no-reward-wrapper" v-else>associate</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <template #closeIcon>
      <SvgIcon name="close" />
    </template>
  </a-modal>
  <modal-register v-model="open"></modal-register>
  <modal-login v-model="showSignIn" @back="handleBack"></modal-login>
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
    border: 2px #1c1c1c;
    background: #0f1012;
    box-shadow: 0px 0px 8px 0px #1c1c1c;
    flex-shrink: 0;

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
    }

    .profile-wrapper {
      display: flex;
      .left {
        width: 147px;

        .item {
          padding: 10px 0 10px 17px;
          height: 40px;
          cursor: pointer;
          border-radius: 18px;
          background: none;
          color: #8d8d8d;
          font-family: Urbanist;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
          line-height: 20px;

          &:hover {
            background: #1c1c1c;
            box-shadow: 0px 0px 24px 0px #1c1c1c;
            color: #ffffff;
          }

          &:active,
          &.active {
            opacity: 1;
            color: #ffffff;
            background: #1c1c1c;
            box-shadow: 0px 0px 24px 0px #1c1c1c;
          }

          .svg-icon {
            width: 14px;
            height: 14px;
            margin-right: 10px;
            margin-bottom: 2px;
          }
        }
      }
      .right {
        flex: 1;
        width: 465px;
        flex-shrink: 0;
        margin-left: 6px;
        border-radius: 12px;
        background: #090c0f;
        padding: 16px 16px 40px 16px;
        .image {
          .title {
            color: #fff;
            font-family: Urbanist;
            font-size: 20px;
            font-style: normal;
            font-weight: 600;
            line-height: 24px; /* 120% */
            text-transform: capitalize;
          }

          .desc {
            color: #8d8d8d;
            font-family: Urbanist;
            font-size: 12px;
            font-style: normal;
            font-weight: 600;
            line-height: normal;
          }
        }

        .image-wrapper {
          position: relative;
          display: flex;
          cursor: pointer;

          .avatar {
            width: 64px;
            height: 64px;
            border-radius: 64px;
            margin-top: 12px;
          }

          .upload-icon {
            width: 64px;
            height: 32px;
            position: absolute;
            left: 0;
            bottom: 0;
            opacity: 0.5;
            background: #1c1c1c;
            border-radius: 0 0 64px 64px;
          }

          .svg-icon {
            width: 14px;
            height: 14px;
            position: absolute;
            left: 25px;
            bottom: 9px;
          }

          .avatar-upload {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            z-index: 9;

            .custom-upload-label {
              width: 100%;
              height: 100%;
              border-radius: 0;
              opacity: 0;
              cursor: pointer;
            }
          }
        }

        .profile {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          color: #fff;
          font-family: Urbanist;

          .user-id,
          .user-name {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            align-self: stretch;
            margin-top: 40px;

            .label {
              font-size: 20px;
              font-style: normal;
              font-weight: 600;
              line-height: 24px;
              text-transform: capitalize;
            }

            .value {
              font-size: 14px;
              font-style: normal;
              font-weight: 600;
              line-height: 20px;
              padding: 0;
            }

            .ant-input {
              padding: 12px 24px;
              color: #ffffff;
              font-size: 14px;
              font-style: normal;
              font-weight: 600;
              line-height: 20px;
              background: #232431;
              border: none;
              width: 433px;
              height: 48px;
              align-items: center;
              flex-shrink: 0;
              border-radius: 43px;
              border: 2px #1c1c1c;
              box-shadow: 0px 0px 8px 0px #1c1c1c;
              background: none;
              margin-top: 5px;

              &::placeholder {
                color: #8d8d8d;
              }
            }

            .tip {
              color: #8d8d8d;
              text-align: center;
              font-size: 12px;
              font-style: normal;
              font-weight: 600;
              line-height: normal;
            }
          }
        }

        .action {
          margin-top: 40px;

          .button-create {
            display: flex;
            width: 100%;
            height: 48px;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            border-radius: 41px;
            background: #fff;
            gap: 10px;
            position: relative;
            text-transform: uppercase;
            color: #0f1012;
            text-align: center;
            font-size: 16px;
            line-height: 12px;
            font-weight: 900;

            &.ant-btn-default:not(:disabled):active,
            &.ant-btn-default:not(:disabled):hover {
              border: none;
            }
          }
        }
      }
    }

    .wallet-login-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      font-family: Urbanist;

      .title {
        color: #ffffff;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
      }

      .row {
        display: flex;
        padding: 12px 12px 12px 0;
        align-items: flex-start;
        gap: 16px;
        align-self: stretch;

        .btn {
          display: flex;
          width: 200px;
          height: 48px;
          padding: 9px 0px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          flex: 1 0 0;
          cursor: pointer;
          border-radius: 80px;
          border: 2px #1c1c1c;
          box-shadow: 0px 0px 8px 0px #1c1c1c;

          &:hover {
            background: #1c1c1c;
          }

          &:active {
            opacity: 0.5;
          }

          .svg-icon {
            width: 160px;
            height: 24px;
          }
        }
      }
    }

    .wallet-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      align-self: stretch;
      font-family: Urbanist;

      background: rgba(0, 0, 0, 0.2);

      .label {
        color: #ffffff;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px; /* 120% */
        text-transform: capitalize;
      }

      .value {
        color: #ffffff;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px; /* 142.857% */
      }
    }

    .email-wrapper {
      font-family: Urbanist;

      .title {
        padding-bottom: 16px;
        color: #ffffff;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
        text-transform: capitalize;
      }

      .ant-form {
        .ant-form-item {
          margin-bottom: 24px;
        }

        .text {
          color: #8d8d8d;
          font-family: Urbanist;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
          line-height: 20px;
        }

        .link {
          color: #fff;
          font-family: Urbanist;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
          line-height: 20px;
          padding: 0;
          height: 20px;
          margin-left: 10px;

          &.ant-btn-link:not(:disabled):active,
          &.ant-btn-link:not(:disabled):hover {
            color: rgba(#f4dca5, 0.8);
          }
        }

        .button-create {
          display: flex;
          width: 100%;
          height: 48px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          border-radius: 41px;
          background: #fff;
          gap: 10px;
          position: relative;
          text-transform: uppercase;
          color: #0f1012;
          text-align: center;
          font-size: 16px;
          line-height: 12px;
          font-weight: 900;

          &.ant-btn-default:not(:disabled):active,
          &.ant-btn-default:not(:disabled):hover {
            border: none;
          }
        }
      }
    }

    .email-address-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      align-self: stretch;
      font-family: Urbanist;
      color: #ffffff;

      .label {
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
      }

      .value {
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
      }
    }

    .social-address-wrapper {
      font-family: Urbanist;

      .title {
        color: #ffffff;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px; /* 120% */
        text-transform: capitalize;
      }

      .actions {
        margin-top: 16px;
      }

      .btn {
        display: flex;
        width: 100%;
        padding: 18px 20px;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        flex-shrink: 0;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        cursor: pointer;
        border-radius: 30px;
        background: #0f1012;
        border: none;

        .text-wrapper {
          display: flex;
          align-items: center;

          .svg-icon {
            width: 24px;
            height: 24px;
          }
        }

        .reward-wrapper {
          color: #8d8d8d;
          text-align: right;
          font-family: Urbanist;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
          line-height: 20px;
          margin-right: 20px;

          span + span {
            margin-left: 8px;
          }
        }

        .no-reward-wrapper {
          color: #fff;
          text-align: center;
          font-family: Urbanist;
          font-size: 12px;
          font-style: normal;
          font-weight: 900;
          line-height: 12px; /* 100% */
          letter-spacing: 0.24px;
          text-transform: uppercase;
          display: flex;
          width: 103px;
          height: 40px;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          border-radius: 22.5px;
          border: 2px #1c1c1c;
          box-shadow: 0px 0px 8px 0px #1c1c1c;
        }

        & + .btn {
          margin-top: 24px;
        }
      }
    }
  }
}
.tgme_widget_login.large button.tgme_widget_login_button {
  opacity: 0;
  cursor: pointer;
}
</style>
