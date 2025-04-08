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
const avatar = ref(userStore.account.avatarUrl)

const handleChange = async (file: File) => {
  profile.avatar = file
}

const { setAccount, setAvatarColor, fetchAccountInfo } = useUserStore()
const onSubmit = async () => {
  try {
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
      // sessionStorage.setItem('telegramType', 'verify')
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
</script>

<template>
  <a-modal
    wrapClassName="modal-profile"
    ref="modalRef"
    v-model:open="showModal"
    :width="688"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="header">
      <div class="title">Edit Profile</div>
      <div class="desc">
        <!-- By logging in to GameBoom, you agree to
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. -->
      </div>
      <div style="width: 100%; height: 2px; background: rgba(255, 255, 255, 0.04)"></div>
    </div>
    <div class="profile-wrapper">
      <div class="left">
        <div
          class="item"
          :class="{ active: profileType === 'setting' }"
          @click="toggleProfileType('setting')"
        >
          Profile Setting
        </div>
        <div
          class="item"
          :class="{ active: profileType === 'wallet' }"
          @click="toggleProfileType('wallet')"
        >
          Wallet Address
        </div>
        <div
          class="item"
          :class="{ active: profileType === 'email' }"
          @click="toggleProfileType('email')"
        >
          Email Address
        </div>
        <div
          class="item"
          :class="{ active: profileType === 'social' }"
          @click="toggleProfileType('social')"
        >
          Social Account
        </div>
      </div>
      <div class="right">
        <template v-if="profileType === 'setting'">
          <div class="image-wrapper">
            <boom-upload
              class="avatar-upload"
              v-model:avatar="avatar"
              @change="handleChange"
            ></boom-upload>
            <div class="image">
              <div class="title">Profile Image</div>
              <div class="desc">
                We recommend an image of at least 300x300.<br />
                GIFs work too. Max 5mb.
              </div>
            </div>
          </div>
          <div class="profile">
            <div class="user-id">
              <div class="label">User ID</div>
              <div class="value">{{ userStore.account.username }}</div>
            </div>
            <div class="user-name">
              <div class="label">User Name</div>
              <a-input
                v-model:value="profile.name"
                placeholder="Enter your User Name"
                autocomplete="off"
              />
              <div class="tip">Changes are allowed every 1 month</div>
            </div>
          </div>
          <div class="action">
            <a-button class="button-create" shape="round" ghost @click="onSubmit">Save</a-button>
          </div>
        </template>

        <template v-if="profileType === 'wallet' && !showWalletAddress">
          <div class="wallet-login-wrapper">
            <div class="title">Sign in with Wallet</div>
            <div class="row">
              <div class="btn" @click="handleWalletConnect('meta')">
                <img src="@/assets/images/wallet/metamask.png" />
                <span>Meta Mask</span>
              </div>
              <div class="btn" @click="handleWalletConnect('okx')">
                <img src="@/assets/images/wallet/okx.png" />
                <span>OKX Wallet</span>
              </div>
            </div>
            <!-- <div class="row">
              <div class="btn" @click="handleWalletConnect('coinbase')">
                <img src="@/assets/images/wallet/coinbase.png" />
                <span>Coinbase Smart Wallet</span>
              </div>
              <div class="btn" @click="handleWalletConnect('math')">
                <img src="@/assets/images/wallet/math.png" />
                <span>Math Wallet</span>
              </div>
            </div> -->
          </div>
        </template>
        <template v-if="profileType === 'wallet' && showWalletAddress">
          <div class="wallet-wrapper">
            <div class="label">Wallet Address</div>
            <div class="value" v-if="walletStore.wallet.address">
              {{ formatAddress(walletStore.wallet.address) }}
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
              <a-form-item label="Your Email Address" name="email">
                <a-input
                  v-model:value="modelRef.email"
                  placeholder="Enter email address"
                  autocomplete="off"
                >
                  <template #suffix>
                    <a-button
                      class="button-send"
                      type="link"
                      :disabled="countdown > 0"
                      @click="handleSendCode"
                    >
                      {{ countdown ? `Resend  Email（${countdown}）` : 'Sent a code' }}
                    </a-button>
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item label="Verification Code" name="confirmCode">
                <a-input
                  v-model:value="modelRef.confirmCode"
                  placeholder="Enter code"
                  autocomplete="off"
                />
              </a-form-item>
              <a-form-item style="margin-top: 25px">
                <a-row>
                  <a-col :span="14">
                    <span class="text">Already a member?</span>
                    <a-button class="link" type="link" @click="openLogin">SIGN IN</a-button>
                  </a-col>
                  <a-col :span="10" style="text-align: right">
                    <a-button class="button-create" shape="round" ghost @click="handleEmailBind">
                      Next
                    </a-button>
                  </a-col>
                </a-row>
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
              <div
                class="btn btn-telegram"
                :class="{ disabled: userStore.account.tgVerified }"
                @click="handleSocialBind('telegram')"
              >
                <div class="text-wrapper">
                  <SvgIcon name="uid-telegram" /> <span>Telegram</span>
                </div>
                <div class="reward-wrapper">
                  <template v-if="userStore.account.tgVerified"> done </template>
                </div>
              </div>
              <div
                class="btn btn-twitter"
                :class="{ disabled: userStore.account.twitterVerified }"
                @click="handleSocialBind('twitter')"
              >
                <div class="text-wrapper">
                  <SvgIcon name="quest-twitter" /> <span>Twitter</span>
                </div>
                <div class="reward-wrapper">
                  <template v-if="userStore.account.twitterVerified"> done </template>
                </div>
              </div>
              <div
                class="btn btn-discord"
                :class="{ disabled: userStore.account.discordVerified }"
                @click="handleSocialBind('discord')"
              >
                <div class="text-wrapper">
                  <SvgIcon name="quest-discord" /> <span>Discord</span>
                </div>

                <div class="reward-wrapper">
                  <template v-if="userStore.account.discordVerified"> done </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </a-modal>
  <modal-register v-model="open"></modal-register>
  <modal-login v-model="showSignIn" @back="handleBack"></modal-login>
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

.profile-wrapper {
  display: flex;
  .left {
    width: 192px;

    .item {
      padding: 15px 0;
      color: rgb(255, 255, 255);
      font-family: Quicksand;
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 26px; /* 130% */
      opacity: 0.5;
      cursor: pointer;

      &:hover {
        opacity: 0.7;
      }

      &:visited {
        opacity: 0.8;
      }

      &:active,
      &.active {
        opacity: 1;
      }
    }
  }
  .right {
    flex: 1;

    .image-wrapper {
      display: flex;
      cursor: pointer;

      .image {
        margin-left: 34px;
        flex: 1;

        .title {
          color: var(--80, rgba(255, 255, 255, 0.8));
          font-family: Quicksand;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%; /* 25.6px */
        }

        .desc {
          color: var(--80, rgba(255, 255, 255, 0.8));
          font-family: Quicksand;
          font-size: 12px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%; /* 19.2px */
        }
      }

      .avatar-upload {
        justify-content: flex-start;
        cursor: pointer;
        width: auto;

        .custom-upload-label {
          border-radius: 0;
          opacity: 0;
          cursor: pointer;
        }
      }
    }

    .profile {
      margin-top: 44px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .user-id,
      .user-name {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        align-self: stretch;

        .label {
          color: var(--80, rgba(255, 255, 255, 0.8));
          font-family: Quicksand;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%; /* 25.6px */
        }

        .value {
          padding: 12px;
          color: var(--100, #fff);
          font-family: Quicksand;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%; /* 22.4px */
        }

        .ant-input {
          padding: 12px;
          color: var(--100, #fff);
          font-family: Quicksand;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%; /* 22.4px */
          border-radius: 8px;
          background: #232431;
          border: none;
          box-shadow: none;

          &::placeholder {
            color: var(--100, #fff);
          }
        }

        .tip {
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          font-family: Quicksand;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: 20px; /* 142.857% */
        }
      }
    }

    .action {
      padding: 12px;

      .button-create {
        border-radius: 48px;
        border-style: solid;
        border-color: #ffffff;
        border-width: 1px;
        padding: 10px 20px 10px 20px;
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 48px;
        position: relative;
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);

        color: #ffffff;
        text-align: left;
        font-family: 'Quicksand-Bold', sans-serif;
        font-size: 14px;
        line-height: 120%;
        font-weight: 700;

        &.ant-btn-default:not(:disabled):active,
        &.ant-btn-default:not(:disabled):hover {
          color: #f4dca5;
          border-color: #f4dca5;
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

  .title {
    margin-bottom: 16px;
    color: var(--80, rgba(255, 255, 255, 0.8));
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%; /* 25.6px */
  }

  .row {
    display: flex;
    padding: 12px 12px 12px 0;
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
  }
}

.wallet-wrapper {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;

  padding: 0px 11px 60px 12px;
  background: rgba(0, 0, 0, 0.2);

  .label {
    color: var(--80, rgba(255, 255, 255, 0.8));
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%; /* 25.6px */
  }

  .value {
    color: #00ffb4;
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%; /* 25.6px */
  }
}

.email-wrapper {
  .title {
    padding-bottom: 16px;
    color: var(--100, #fff);
    font-family: Quicksand;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 26px; /* 108.333% */
    text-transform: capitalize;
    border-bottom: 2px solid var(--4, rgba(255, 255, 255, 0.04));
  }

  .ant-form {
    margin-top: 16px;

    .ant-form-item {
      margin-bottom: 24px;
    }

    .ant-input {
      padding: 12px;
      height: 46px;
      color: var(--100, #fff);
      font-family: Quicksand;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 160%; /* 22.4px */
      border-radius: 8px;
      background: #232431;
      border: none;
      box-shadow: none;
    }

    .ant-input-suffix {
      background: #232431;
    }

    .text {
      color: #838383;
      font-size: 14px;
      line-height: 120%;
      font-weight: 700;
    }

    .link {
      color: #f4dca5;
      font-size: 14px;
      line-height: 120%;
      font-weight: 700;

      &.ant-btn-link:not(:disabled):active,
      &.ant-btn-link:not(:disabled):hover {
        color: rgba(#f4dca5, 0.8);
      }
    }

    .button-create {
      border-radius: 48px;
      border-style: solid;
      border-color: #ffffff;
      border-width: 1px;
      padding: 10px 20px 10px 20px;
      display: flex;
      flex-direction: row;
      gap: 10px;
      align-items: center;
      justify-content: center;
      width: 182px;
      height: 40px;
      position: relative;
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);

      color: #ffffff;
      text-align: left;
      font-family: 'Quicksand-Bold', sans-serif;
      font-size: 14px;
      line-height: 120%;
      font-weight: 700;

      &.ant-btn-default:not(:disabled):active,
      &.ant-btn-default:not(:disabled):hover {
        color: #f4dca5;
        border-color: #f4dca5;
      }

      @media screen and (max-width: 506px) {
        width: 100%;
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

  padding: 0px 11px 212px 12px;
  background: rgba(0, 0, 0, 0.2);

  .label {
    color: var(--80, rgba(255, 255, 255, 0.8));
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%; /* 25.6px */
  }

  .value {
    color: #00ffb4;
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%; /* 25.6px */
  }
}

.social-address-wrapper {
  .title {
    color: var(--80, rgba(255, 255, 255, 0.8));
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%; /* 25.6px */
  }

  .actions {
    padding: 12px;
  }

  .btn {
    display: flex;
    width: 100%;
    padding: 12px;
    justify-content: space-between;
    align-items: center;

    border-radius: 48px;

    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    cursor: pointer;

    .text-wrapper {
      display: flex;
      align-items: center;

      .svg-icon {
        margin-right: 8px;
        font-size: 24px;
      }
    }

    .reward-wrapper {
      text-transform: uppercase;

      span + span {
        margin-left: 8px;
      }
    }

    & + .btn {
      margin-top: 24px;
    }

    &:hover {
      opacity: 0.8;
    }

    &:active {
      opacity: 0.5;
    }

    &.btn-telegram {
      color: #009dfa;
      border: 1px solid #009dfa;
      background: rgba(0, 157, 250, 0.08);
    }

    &.btn-twitter {
      color: #009dfa;
      border: 1px solid #009dfa;
      background: rgba(0, 157, 250, 0.08);
    }

    &.btn-discord {
      color: #5865f2;
      border: 1px solid #5865f2;
      background: rgba(88, 101, 242, 0.08);
    }

    &.disabled {
      color: #9f9f9f;
      border: 1px solid #9f9f9f;
      opacity: 0.5;
      background: rgba(88, 101, 242, 0);

      .reward-wrapper {
        text-transform: capitalize;
      }
    }
  }
}

.tgme_widget_login.large button.tgme_widget_login_button {
  opacity: 0;
  cursor: pointer;
}
</style>
<style>
.modal-profile {
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
