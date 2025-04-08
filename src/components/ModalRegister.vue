<script lang="ts" setup>
import { register, sendEmail } from '@/apis/index'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import { useModalStore } from '@/stores/modal'
import { connectWallet } from '@/services/NftService'
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref, toRaw, watch } from 'vue'

const { setAccessToken } = useUserStore()

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
  },
)

// 这个是根据store里面的变化来打开这个modal，用于welcome modal里面的signup mode
const modalStore = useModalStore()
watch(
  () => modalStore.isRegisterModalVisible,
  (newVal) => {
    showModal.value = newVal
  },
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 表单属性
const modelRef = reactive({
  email: '',
  confirmCode: '',
})

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
      trigger: 'blur',
    },
  ],
  confirmCode: [
    {
      required: true,
      validator: validateCode,
      trigger: 'blur',
    },
  ],
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
    const res = await sendEmail(modelRef.email)
    console.log(res)
  } catch (error: any) {
    console.error(error)
    message.error(error.detail, 5)
  }
}

const formRef = ref()
// 提交表单
const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      const socialInviteCode = sessionStorage.getItem('invite')

      const { token }: any = await register({ ...toRaw(modelRef), socialInviteCode })

      // 如果邀请码存在，则删除
      if (socialInviteCode) sessionStorage.removeItem('invite')

      setAccessToken(token)
      // 如果注册成功后，也要链接钱包，如果已经链接钱包，则把钱包的信息发给后端和用户绑定
      connectWallet('metaMaskSDK')
      modalStore.toggleRegisterModal(false)
      emit('update:modelValue', false)

      // 跳转设置账户页面
      openInfoModal()
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

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  modalStore.toggleRegisterModal(false)
  emit('update:modelValue', false)
}

const showSignIn = ref(false)
const openLogin = () => {
  handleClose()
  showSignIn.value = true
}

const showInfoModal = ref(false)
const openInfoModal = () => {
  handleClose()
  showInfoModal.value = true
}

// 处理Login moadal 返回操作，打开register modal
const handleBack = () => {
  emit('update:modelValue', true)
}
</script>

<template>
  <a-modal wrapClassName="custom-modal modal-register" ref="modalRef" v-model:open="showModal" :width="480"
    :footer="null" :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="title">Create your GamerBoom Account</div>
      <SvgIcon name="header-close" @click="$emit('update:modelValue', false)" />
    </div>
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
    </a-form>
    <div class="form-action">
      <div class="button button-primary" @click="onSubmit">Create</div>
      <div class="link-wrapper">
        <span class="text">Already a member?</span>
        <a-button class="link" type="link" @click="openLogin">SIGN IN</a-button>
      </div>
    </div>
  </a-modal>
  <modal-login v-model="showSignIn" @back="handleBack"></modal-login>
  <modal-info v-model="showInfoModal"></modal-info>
</template>

<style lang="scss" scoped>
.ant-form {
  width: 100%;

  .ant-form-item {
    margin-bottom: 16px;

    :deep(.ant-form-item-label) label {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 22px;
      /* 157.143% */
    }

    :deep(.ant-input-affix-wrapper) {
      border-radius: 12px;
      border: 1.5px solid rgba(110, 110, 115, 0.2);
    }

    .ant-input {
      display: flex;
      height: 40px;
      padding: 0 16px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      align-self: stretch;
      border-radius: 12px;
      border: 1.5px solid rgba(110, 110, 115, 0.2);
    }

    .button-send {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 14px;
      line-height: 18px;

      :deep(span) {
        font-weight: 700;
      }
    }
  }
}
</style>