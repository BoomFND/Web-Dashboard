<script lang="ts" setup>
import { useWallet } from '@/hooks/useWallet'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'
import { useTelegramStore } from '@/stores/telegram'
import { putAccount } from '@/apis/index'
import { notification } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { bindEmail, sendBindEmailCode } from '@/apis/uid'
import { message } from 'ant-design-vue'
import SvgIcon from '@/components/commons/SvgIcon.vue'
import useClipboard from 'vue-clipboard3'
import type { EvmWallet, Wallet } from '@/types/wallet'
import { computed, h, reactive, ref, toRaw, watch } from 'vue'
import { setPwd } from '@/apis/game_tasks'
import { useModalStore, type ProfileType } from '@/stores/modal'

// 定义双向绑定的modelValue
interface Props {
  modelValue: boolean
  type: ProfileType
}
const props = defineProps<Props>()

// 通过watch监听modelValue，实现数据的修改
const showModal = ref(false)
const showBindError = ref(false)
const profileType = ref(props.type)
const { connectWallet, solanaWallets, bindSolana } = useWallet()

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
      showWalletAddress.value = !!walletStore.wallet.address || !!walletStore.solanaWallet.address

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
const modalStore = useModalStore()
const { toClipboard } = useClipboard()

watch(
  () => modalStore.isProfileModalVisible,
  (newV) => {
    showModal.value = newV
  }
)

watch(
  () => modalStore.profileType,
  (newV) => {
    profileType.value = newV
  }
)

watch(
  () => modalStore.profileWalletType,
  (newV) => {
    switch (newV) {
      case 'evm':
        bindEVMWallet()
        break;
      case 'solana':
        bindSolanaWallet()
        break;
    }
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  modalStore.toggleProfileModal(false)
  emit('update:modelValue', false)
}

const open = ref<boolean>(false)

////////////profile setting START//////////////////

const toggleProfileType = (type: ProfileType) => {
  profileType.value = type
}

const profile = reactive({
  name: userStore.account.name,
  avatar: userStore.account.avatarUrl
})
const avatar = ref(userStore.account.avatarUrl)

const uploadError = ref('')
const canSubmit = computed(() => {
  // 如果上传头像或者名字有改动，并且都没有错误，则可以提交
  if (!profile.name) return false
  if (userStore.account.avatarUrl && !profile.avatar) return false
  if (profile.name !== userStore.account.name || profile.avatar !== userStore.account.avatarUrl) {
    return !uploadError.value
  }
  return false
})
const handleChange = async (file: File) => {
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'File size exceeds the limit of 5MB'
    return
  }
  uploadError.value = ''
  profile.avatar = file
}

const { setAccount, setAvatarColor, fetchAccountInfo } = useUserStore()
const onSubmit = async () => {
  if (!canSubmit.value) return
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
        h(SvgIcon, {
          name: 'common-close',
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
          name: 'common-checked',
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
const bindEVMWallet = async () => {
  if (!userStore.account.walletAddress) {
    showWalletAddress.value = false
  }
}

const bindSolanaWallet = () => {
  if (!userStore.account.solanaAddress) {
    showWalletAddress.value = false
  }
}

const handleAddressCopy = async (type: 'evm' | 'sol') => {
  try {
    if (!userStore.account.walletAddress && !userStore.account.solanaAddress) return
    const address =
      type === 'evm'
        ? (userStore.account.walletAddress ?? '')
        : (userStore.account.solanaAddress ?? '')
    await toClipboard(address)
    message.success('Copied success!')
  } catch (error) {
    console.error(error)
  }
}
////////////Wallet Address END//////////////////

////////////email登录注册 START//////////////////
const showEmailAddress = ref(!!userStore.account.email)

// 表单属性
const modelRef = reactive({
  email: '',
  confirmCode: '',
  password: ''
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
// 自定义密码验证
const validatePassword = async () => {
  if (!modelRef.password) {
    return Promise.reject('Please input the correct password')
  }

  // 添加密码格式验证：8-12字符，必须包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/
  if (!passwordRegex.test(modelRef.password)) {
    return Promise.reject('Minimum 8-12 characters, including letters and numbers.')
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
  ],
  password: [
    {
      required: true,
      validator: validatePassword,
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
    await sendBindEmailCode(modelRef.email)
  } catch (error: any) {
    console.error(error)
    // message.error(error.detail, 5)
  }
}

const formRef = ref()
// 提交表单
const handleEmailBind = () => {
  formRef.value
    .validate()
    .then(async () => {
      await Promise.all([bindEmail({ ...toRaw(modelRef) }), setPwd(modelRef.password)])

      // 设置account
      // 请求用户信息
      fetchAccountInfo()

      // 切换成email address展示页面
      showEmailAddress.value = true
    })
    .catch((err: any) => {
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
      // 如果已认证，则不做处理
      if (userStore.account.discordVerified) return
      // 否则，去认证
      // 设置是认证
      sessionStorage.setItem('discordType', 'verify')
      discordStore.fetchUrl()
      break
    case 'twitter':
      if (userStore.account.twitterVerified) return
      // 设置是认证
      sessionStorage.setItem('twitterType', 'verify')
      twitterStore.fetchUrl()
      // connectWallet(type)
      break
  }
}

const handleBindSolanaWallet = async (wallet: Wallet) => {
  try {
    await bindSolana(wallet)
    await handleClose()
    // 请求用户信息
    await fetchAccountInfo()
    showWalletAddress.value = !!walletStore.wallet.address || !!walletStore.solanaWallet.address
  } catch (error: any) {
    if (error?.code === 'bindError') {
      showBindError.value = true
    }
  }
}

const handleBindEvmWallet = async (wallet: EvmWallet) => {
  try {
    await connectWallet(wallet, 'bind')
    await handleClose()
    // 请求用户信息
    await fetchAccountInfo()
    showWalletAddress.value = !!walletStore.wallet.address || !!walletStore.solanaWallet.address
  } catch (error: any) {
    if (error?.code === 'bindError') {
      showBindError.value = true
    }
  }
}

////////////SOCIAL认证 END//////////////////
</script>

<template>
  <a-modal wrapClassName="custom-modal modal-profile" ref="modalRef" v-model:open="showModal" :width="571"
    :footer="null" :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="title">Edit Profile</div>
      <SvgIcon name="header-close" @click="handleClose()" />
    </div>
    <div class="top">
      <div class="item" :class="{ active: profileType === 'setting' }" @click="toggleProfileType('setting')">
        Profile Setting
      </div>
      <div class="item" :class="{ active: profileType === 'wallet' }" @click="toggleProfileType('wallet')">
        Wallet Address
      </div>
      <div class="item" :class="{ active: profileType === 'email' }" @click="toggleProfileType('email')">
        Email Address
      </div>
      <div class="item" :class="{ active: profileType === 'social' }" @click="toggleProfileType('social')">
        Social Account
      </div>
    </div>
    <div class="bottom">
      <template v-if="profileType === 'setting'">
        <div class="info">
          <div class="image-label">Profile Image</div>
          <div class="image-value">
            <BoomUpload class="avatar-upload" :class="{ error: !!uploadError }" v-model:avatar="avatar"
              @change="handleChange" />
            <div class="user-id">
              <div class="label">User ID</div>
              <div class="value">{{ userStore.account.username }}</div>
            </div>
          </div>
          <div class="error-tip" v-if="uploadError">{{ uploadError }}</div>
          <div class="tip" v-else>
            *We recommend an image of at least 300x300.<br />
            GIFs work too. Max 5mb.
          </div>
        </div>
        <div class="user-name">
          <div class="label">User Name</div>
          <a-input v-model:value="profile.name" placeholder="Enter your User Name" autocomplete="off"
            :status="!profile.name ? 'error' : ''" />
          <div class="error-tip" v-if="!profile.name">User name is required</div>
          <div class="tip" v-else>Changes are allowed every 1 month</div>
        </div>
        <div class="action">
          <div class="button button-primary" :class="{ disabled: !canSubmit }" @click="onSubmit">
            Save
          </div>
        </div>
      </template>

      <template v-if="profileType === 'wallet'">
        <div class="bind-wallet-list">
          <div class="wallet-item evm" v-if="userStore.account.walletAddress">
            <div class="wallet-icon">
              <SvgIcon name="entry-evm" />
            </div>
            <div class="wrapper">
              <div class="label">Ethereum</div>
              <div class="value">
                <div class="text">{{ userStore.account.walletAddress }}</div>
                <SvgIcon name="common-copy" @click="handleAddressCopy('evm')" />
              </div>
            </div>
          </div>
          <div class="wallet-item solana" v-if="userStore.account.solanaAddress">
            <div class="wallet-icon">
              <SvgIcon name="entry-sol" />
            </div>
            <div class="wrapper">
              <div class="label">Solana</div>
              <div class="value">
                <div class="text">{{ userStore.account.solanaAddress }}</div>
                <SvgIcon name="common-copy" @click="handleAddressCopy('sol')" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="profileType === 'wallet' && !showWalletAddress">
        <section class="wallet-login-wrapper">
          <div class="title">Sign in with Crypto Wallet</div>
          <div class="list" v-if="!userStore.account.walletAddress">
            <div class="item">
              <div class="item__left">
                <div class="icon-wrapper">
                  <SvgIcon name="entry-metamask"></SvgIcon>
                </div>
                <span>MetaMask</span>
              </div>
              <div class="item__right">
                <div class="button button-default" @click="handleBindEvmWallet('metaMaskSDK')">
                  Connect
                </div>
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
                <div class="button button-default" @click="handleBindEvmWallet('binanceWallet')">
                  Connect
                </div>
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
                <div class="button button-default" @click="handleBindEvmWallet('okxWallet')">
                  Connect
                </div>
              </div>
            </div>
          </div>
          <div class="list" v-if="!userStore.account.solanaAddress">
            <div class="item" v-for="wallet in solanaWallets.filter((w) => w.adapter.name !== 'MetaMask')"
              :key="wallet.adapter.name">
              <div class="item__left">
                <div class="icon-wrapper">
                  <img :src="wallet.adapter.icon" :alt="wallet.adapter.name" />
                </div>
                <span>{{ wallet.adapter.name }}</span>
              </div>
              <div class="item__right">
                <div class="button button-default" @click="handleBindSolanaWallet(wallet)">
                  Connect
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
      <template v-if="profileType === 'wallet' && showWalletAddress">
        <div class="action" v-if="!userStore.account.walletAddress">
          <div class="button button-primary" @click="bindEVMWallet">Bind EVM Address</div>
        </div>
        <div class="action" v-if="!userStore.account.solanaAddress">
          <div class="button button-primary" @click="bindSolanaWallet">Bind SOL Address</div>
        </div>
      </template>
      <template v-if="profileType === 'email' && !showEmailAddress">
        <div class="email-wrapper">
          <div class="title">Create Your Email Account</div>
          <a-form ref="formRef" layout="vertical" :rules="rules" :model="modelRef">
            <a-form-item label="Email Address" name="email">
              <a-input v-model:value="modelRef.email" placeholder="Enter email address" autocomplete="off">
                <template #suffix>
                  <a-button class="button-send" type="link" :disabled="countdown > 0" @click="handleSendCode">
                    {{ countdown ? `Resend Email（${countdown}）` : 'Sent a code' }}
                  </a-button>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item label="Verification Code" name="confirmCode">
              <a-input v-model:value="modelRef.confirmCode" placeholder="Enter code" autocomplete="off" />
            </a-form-item>

            <a-form-item label="Password" name="password">
              <a-input v-model:value="modelRef.password" placeholder="Enter your Password" autocomplete="off"
                type="password" />
            </a-form-item>

            <a-form-item style="margin-top: 16px">
              <div class="button button-primary" @click="handleEmailBind">Bind</div>
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
          <div class="actions" :class="{
            'has-bind':
              userStore.account.twitterVerified ||
              userStore.account.tgVerified ||
              userStore.account.discordVerified
          }">
            <div v-if="!userStore.account.twitterVerified" class="button button-default"
              @click="handleSocialBind('twitter')">
              <SvgIcon name="social-x" />
            </div>
            <div v-else class="finished-button">
              <SvgIcon name="social-complete" />
              <div class="text">{{ `X: @${userStore.account.twitterName}` }}</div>
            </div>
            <div v-if="!userStore.account.tgVerified" class="button button-default"
              @click="handleSocialBind('telegram')">
              <SvgIcon name="social-tg" />
            </div>
            <div v-else class="finished-button">
              <SvgIcon name="social-complete" />
              <div class="text">{{ `Telegram: @${userStore.account.tgName}` }}</div>
            </div>
            <div v-if="!userStore.account.discordVerified" class="button button-default"
              @click="handleSocialBind('discord')">
              <SvgIcon name="social-discord" />
            </div>
            <div v-else class="finished-button">
              <SvgIcon name="social-complete" />
              <div class="text">{{ `Discord: ${userStore.account.discordName}` }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </a-modal>
  <modal-register v-model="open"></modal-register>
  <modal-login v-model="showSignIn" @back="handleBack"></modal-login>
  <modal-bind-error v-model="showBindError"></modal-bind-error>
</template>

<style lang="scss" scoped>
:global(.modal-profile .ant-modal-content .ant-modal-body) {
  gap: 32px !important;
}

.top {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 44px;
  padding: 2px 4px;
  border-radius: 80px;
  background: #f8f8f8;

  .item {
    display: flex;
    width: 120px;
    padding: 8px 0;
    justify-content: center;
    align-items: center;
    border-radius: 40px;
    background: rgba(29, 29, 31, 0);
    color: #1d1d1f;
    text-align: center;
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
    cursor: pointer;

    &:hover,
    &:active,
    &.active {
      justify-content: center;
      align-items: center;
      border-radius: 40px;
      background: #1d1d1f;
      text-align: center;
      color: #fff;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
    }
  }
}

.bottom {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;

  .info {
    .image-label {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 22px;
    }

    .image-value {
      margin-top: 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      align-self: stretch;

      .user-id {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 8px;

        .label {
          color: #86868b;
          text-align: center;
          font-family: Urbanist;
          font-size: 16px;
          font-style: normal;
          font-weight: 600;
          line-height: 18px;
        }

        .value {
          color: #1d1d1f;
          font-family: Urbanist;
          font-size: 18px;
          font-style: normal;
          font-weight: 700;
          line-height: 26px;
        }
      }

      .error {
        border: 1.5px solid #ff4d4f;
      }
    }

    .tip {
      margin-top: 12px;
      color: #ffa800;
      font-family: Urbanist;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      /* 166.667% */
    }
  }

  .error-tip {
    color: #ff4d4f;
  }

  .user-name {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;

    .label {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 22px;
    }

    .tip {
      color: #ffa800;
      font-family: Urbanist;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
    }
  }

  .action {
    width: 100%;
  }
}

.wallet-login-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;

  .title {
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

.bind-wallet-list {
  display: flex;
  flex-direction: column;
  gap: 32px;

  .wallet-item {
    display: flex;
    width: 100%;
    height: 52px;
    align-items: center;
    gap: 18px;

    .wallet-icon {
      display: flex;
      width: 40px;
      height: 40px;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      background: #f5f5f7;

      .svg-icon {
        width: 100%;
        height: 100%;
      }
    }

    .svg-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }

    .wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 8px;
      flex: 1 0 0;

      .label {
        color: #86868b;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
        /* 150% */
      }

      .value {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        align-self: stretch;

        .text {
          color: #1d1d1f;
          font-family: Urbanist;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: 26px;
        }

        .svg-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          cursor: pointer;
        }
      }
    }

    .action {
      width: 100%;
    }
  }
}

.email-wrapper {
  .title {
    color: var(--color-dialog-label);
    font-family: Urbanist;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 150%;
  }

  .ant-form {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .ant-form-item {
      margin-bottom: 0;
    }

    .ant-input {
      display: flex;
      height: 40px;
      padding: 0px 16px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      align-self: stretch;
      // border-radius: 12px;
      border: 1.5px solid rgba(110, 110, 115, 0.2);
    }

    .ant-input-suffix {
      background: #232431;
    }

    .link-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      .text {
        color: rgba(29, 29, 31, 0.3);
        font-family: Urbanist;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 18px;
        /* 128.571% */
      }

      .link {
        color: #1d1d1f;
        font-family: Urbanist;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        height: 14px;
        line-height: 100%;
        padding: 0;

        &.ant-btn-link:not(:disabled):active,
        &.ant-btn-link:not(:disabled):hover {
          color: rgba(#1d1d1f, 0.8);
        }
      }
    }

    .button-send {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      line-height: 18px;

      :deep(span) {
        font-weight: 700;
      }

      &:hover {
        opacity: 0.7;
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

  .label {
    color: #86868b;
    text-align: center;
    font-family: Urbanist;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
  }

  .value {
    color: #1d1d1f;
    font-family: Urbanist;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 26px;
  }
}

.social-address-wrapper {
  .title {
    color: var(--80, rgba(255, 255, 255, 0.8));
    font-family: Urbanist;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 160%;
    /* 25.6px */
  }

  .actions {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    align-self: stretch;

    &.has-bind {
      flex-direction: column;
    }
  }

  .button {
    width: 153px;
    height: 36px;
    padding: 0px 24px;
  }

  .finished {
    width: 32px;
    height: 32px;
  }

  .finished-button {
    display: flex;
    height: 36px;
    padding: 0px 16px;
    align-items: center;
    gap: 8px;
    border-radius: 80px;
    background: #0ac2c2;
    color: #fff;
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px;
    /* 171.429% */

    .svg-icon {
      width: 20px;
      height: 20px;
    }
  }
}

.tgme_widget_login.large button.tgme_widget_login_button {
  opacity: 0;
  cursor: pointer;
}
</style>