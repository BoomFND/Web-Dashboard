<script lang="ts" setup>
import { login, getAccount } from '@/apis/index'
import { useUserStore, type Account } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { message } from 'ant-design-vue'
import { useModalStore } from '@/stores/modal'
import { useWallet } from '@/hooks/useWallet'
import type { Rule } from 'ant-design-vue/es/form'
import ModalProfile from './uid/ModalProfile.vue'
import LinkWallet from './uid/LinkWallet.vue'
import { reactive, ref, watch } from 'vue'

const userStore = useUserStore()
const walletStore = useWalletStore()
const modalStore = useModalStore()
const { connectWallet } = useWallet()

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

// watch(
//   () => modalStore.isSignInModalVisible,
//   (newVal) => {
//     showModal.value = newVal
//   }
// )

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue', 'back'])

// 表单属性
const modelRef = reactive({
  email: '',
  pw: ''
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

// 校验规则
const rules: Record<string, Rule[]> = {
  email: [
    {
      required: true,
      validator: validateEmail,
      trigger: 'blur'
    }
  ],
  pw: [
    {
      required: true,
      message: 'Please input the correct password',
      trigger: 'blur'
    }
  ]
}

const formRef = ref()
const showConfirmEmail = ref(false)
const showModalProfile = ref<boolean>(false)
const showLinkWallet = ref<boolean>(false)
// 提交表单
const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      const { token, hasOtherBind }: any = await login(modelRef.email, modelRef.pw)
      userStore.setAccessToken(token)

      // 请求用户信息
      const res = await getAccount()
      userStore.setAccount(res as Account)
      modalStore.toggleSignInModal(false)
      if (hasOtherBind) {
        showConfirmEmail.value = true
      }

      // 查看用户是否绑定钱包，没有则跳转过去进行绑定
      if (!userStore.account.walletAddress) {
        showModalProfile.value = true
      } else if (!walletStore.wallet.address) {
        // 如果没有登录钱包，则打开钱包登录页面
        showLinkWallet.value = true
      }
      emit('update:modelValue', false)

      formRef.value.resetFields()
      formRef.value.clearValidate()
    })
    .catch((err: any) => {
      console.log('error', err)
      if (err.detail) {
        message.error(err.detail, 5)
      }
    })
}

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  modalStore.toggleSignInModal(false)
  emit('update:modelValue', false)
}

const isResetModalVisible = ref(false)
// 打开重置密码modal
const openResetModal = () => {
  isResetModalVisible.value = true
}
</script>

<template>
  <a-modal wrapClassName="custom-modal modal-login" ref="modalRef" v-model:open="showModal" :width="480" :footer="null"
    :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="left-wrapper">
        <div class="title">SIGN IN YOUR ACCOUNT</div>
      </div>
      <SvgIcon name="header-close" @click="$emit('update:modelValue', false)" />
    </div>
    <a-form ref="formRef" layout="vertical" :rules="rules" :model="modelRef" @keyup.enter="onSubmit">
      <a-form-item label="Your Email Address" name="email">
        <a-input v-model:value="modelRef.email" placeholder="Enter email address " autocomplete="off" />
      </a-form-item>
      <a-form-item label="Your password" name="pw">
        <a-input v-model:value="modelRef.pw" type="password" placeholder="Password" />
      </a-form-item>
    </a-form>
    <div class="form-action">
      <div class="button button-primary" @click="onSubmit">Sign In</div>
      <a-button class="link" type="link" @click="openResetModal">Forgot password?</a-button>
    </div>
    <modal-reset v-model="isResetModalVisible" />
    <ConfirmEmail v-model="showConfirmEmail"></ConfirmEmail>
    <ModalProfile v-model="showModalProfile" type="wallet" />
    <LinkWallet v-model="showLinkWallet" />
  </a-modal>
</template>

<style lang="scss" scoped>
.link {
  color: #0071e3;
  font-size: 14px;
  line-height: 120%;
  font-weight: 700;

  &.ant-btn-link:not(:disabled):active,
  &.ant-btn-link:not(:disabled):hover {
    color: rgba(#0071e3, 0.8);
  }
}
</style>