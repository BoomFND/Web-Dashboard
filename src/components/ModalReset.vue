<script lang="ts" setup>
import { resetPw, sendResetEmail } from '@/apis/index'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'

const userStore = useUserStore()

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

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue', 'back'])

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
    const res = await sendResetEmail(modelRef.email)
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
      const { token }: any = await resetPw(toRaw(modelRef))
      userStore.setResetPwAccessToken(token)
      emit('update:modelValue', false)

      // 跳转设置账户页面
      openResetPwModal()
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
  emit('update:modelValue', false)
}

const showPwModal = ref(false)
const openResetPwModal = () => {
  handleClose()
  showPwModal.value = true
}

// 处理Login moadal 返回操作，打开register modal
const handleBack = () => {
  handleClose()
  emit('back')
  // 返回，重置modal表单内容
  formRef.value.resetFields()
  formRef.value.clearValidate()
  if (timer2.value) clearInterval(timer2.value)
}
</script>

<template>
  <a-modal
    wrapClassName="custom-modal modal-reset"
    ref="modalRef"
    v-model:open="showModal"
    :width="480"
    :footer="null"
    :closable="false"
    @cancel="handleClose"
  >
    <div class="header">
      <div class="left-wrapper">
        <svg-icon name="arrow-left" @click="handleBack"></svg-icon>
        <div class="title">RESET PASSWORD</div>
      </div>
      <SvgIcon name="header-close" @click="$emit('update:modelValue', false)" />
    </div>
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
              {{ countdown ? `Resend  Email（${countdown}）` : 'Send a code' }}
            </a-button>
          </template>
        </a-input>
      </a-form-item>
      <a-form-item label="Verification Code" name="confirmCode">
        <a-input v-model:value="modelRef.confirmCode" placeholder="Enter code" autocomplete="off" />
      </a-form-item>
    </a-form>
    <div class="form-action">
      <div class="button button-primary" @click="onSubmit">Next</div>
    </div>
  </a-modal>
  <modal-reset-pw v-model="showPwModal" />
</template>

<style lang="scss" scoped>
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
</style>
