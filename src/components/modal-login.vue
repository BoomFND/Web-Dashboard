<script lang="ts" setup>
import { login, getAccount } from '@/apis/index'
import { useUserStore, type Account } from '@/stores/user'
import { message } from 'ant-design-vue'
import { useModalStore } from '@/stores/modal'
import { connectWallet } from '@/services/NftService'
import type { Rule } from 'ant-design-vue/es/form'

const { setAccessToken, setAccount } = useUserStore()
const modalStore = useModalStore()

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

watch(
  () => modalStore.isSignInModalVisible,
  (newVal) => {
    showModal.value = newVal
  }
)

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
// 提交表单
const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      const { token }: any = await login(modelRef.email, modelRef.pw)
      console.log(token)
      setAccessToken(token)

      // 请求用户信息
      const res = await getAccount()
      setAccount(res as Account)
      modalStore.toggleSignInModal(false)
      // 登录成功后再链接钱包
      connectWallet('meta')
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

// 处理返回
const handleBack = () => {
  handleClose()
  emit('back')

  // 返回，重置modal表单内容
  formRef.value.resetFields()
  formRef.value.clearValidate()
}

const isResetModalVisible = ref(false)
// 打开重置密码modal
const openResetModal = () => {
  isResetModalVisible.value = true
}

const emailIconColor = ref('#8D8D8D')
const codeIconColor = ref('#8D8D8D')
</script>

<template>
  <a-modal ref="modalRef" v-model:open="showModal" :footer="null" @cancel="handleClose">
    <template #closeIcon>
      <SvgIcon name="close" />
    </template>
    <a-form ref="formRef" layout="vertical" :rules="rules" :model="modelRef">
      <a-form-item name="email" class="margin-top-60">
        <a-input
          v-model:value="modelRef.email"
          placeholder="Enter email address "
          @focus="emailIconColor='#FFFFFF'"
          @blur="emailIconColor='#8D8D8D'"
          autocomplete="off">
          <template #prefix>
            <SvgIcon name="account-email" class="margin-left-24" :color="emailIconColor" />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item name="pw" class="margin-top-40">
        <a-input
          v-model:value="modelRef.pw"
          type="password"
          @focus="codeIconColor='#FFFFFF'"
          @blur="codeIconColor='#8D8D8D'"
          placeholder="Password">
          <template #prefix>
            <SvgIcon name="account-verify_code" class="margin-left-24" :color="codeIconColor" />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item class="margin-top-40">
        <a-button class="button-create" shape="round" ghost @click="onSubmit">Sign In</a-button>
      </a-form-item>
      <a-form-item style="text-align: center">
        <a-button class="link" type="link" @click="openResetModal">Forgot password?</a-button>
      </a-form-item>
    </a-form>

    <template #title>
      <div>Sign in your account</div>
    </template>
  </a-modal>
  <modal-reset v-model="isResetModalVisible" />
</template>

<style lang="scss" scoped>
.link {
  color: #8D8D8D;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;

  &.ant-btn-link:not(:disabled):active,
  &.ant-btn-link:not(:disabled):hover {
    //color: rgba(#f4dca5, 0.8);
    color: #8D8D8D;
  }
}

.button-create {
  width: 624px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 41px;
  background: #8D8D8D;
  border: none;
  color: #0F1012;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 900;
  line-height: 12px;
  letter-spacing: 0.24px;
  text-transform: uppercase;

  &.ant-btn-default:not(:disabled):active,
  &.ant-btn-default:not(:disabled):hover {
    background: #FFFFFF;
    color: #0F1012;
  }

  @media screen and (max-width: 506px) {
    width: 100%;
  }
}

.title-wrapper {
  display: flex;
  align-items: center;

  .svg-icon {
    cursor: pointer;
    margin-left: -3px;
    width: 30px;
  }
}
</style>
