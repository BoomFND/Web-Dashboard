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
</script>

<template>
  <a-modal ref="modalRef" v-model:open="showModal" :footer="null" @cancel="handleClose">
    <a-form ref="formRef" layout="vertical" :rules="rules" :model="modelRef">
      <a-form-item label="Your Email Address" name="email">
        <a-input
          v-model:value="modelRef.email"
          placeholder="Enter email address "
          autocomplete="off"
        />
      </a-form-item>
      <a-form-item label="Your password" name="pw">
        <a-input v-model:value="modelRef.pw" type="password" placeholder="Password" />
      </a-form-item>
      <a-form-item style="margin-top: 25px">
        <a-row>
          <a-col :span="14">
            <a-button class="link" type="link" @click="openResetModal">Forgot password?</a-button>
          </a-col>
          <a-col :span="10" style="text-align: right">
            <a-button class="button-create" shape="round" ghost @click="onSubmit">Sign In</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>

    <template #title>
      <div class="title-wrapper">
        <svg-icon name="arrow-left" @click="handleBack"></svg-icon>
        <div class="title">SIGN IN YOUR ACCOUNT</div>
      </div>
    </template>
  </a-modal>
  <modal-reset v-model="isResetModalVisible" />
</template>

<style lang="scss" scoped>
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
