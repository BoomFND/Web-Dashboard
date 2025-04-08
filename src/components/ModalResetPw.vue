<script lang="ts" setup>
import { putPw } from '@/apis/index'
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
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue', 'back'])

// 表单属性
const modelRef = reactive({
  pw: '',
  pw2: ''
})

// 确认密码验证
const validatePw = async () => {
  if (!modelRef.pw) {
    return Promise.reject('Password is required')
  }
  // 添加密码格式验证：8-12字符，必须包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/
  if (!passwordRegex.test(modelRef.pw)) {
    return Promise.reject('Minimum 8-12 characters, including letters and numbers.')
  }

  // else if (modelRef.pw.length) {
  //   return Promise.reject('Password must be over 6 letters')
  // }

  return Promise.resolve()
}

// 确认密码验证
const validatePw2 = async () => {
  if (!modelRef.pw2) {
    return Promise.reject('Confirm password is required')
  }
  const passwordRegex2 = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/
  if (!passwordRegex2.test(modelRef.pw2)) {
    return Promise.reject('Minimum 8-12 characters, including letters and numbers.')
  }
  // else if (modelRef.pw2.length) {
  //   return Promise.reject('Confirm password must be over 6 letters')
  // }
  else if (modelRef.pw !== modelRef.pw2) {
    return Promise.reject('Enter the password twice inconsistent')
  }
  return Promise.resolve()
}

// 校验规则
const rules: Record<string, Rule[]> = {
  pw: [
    {
      required: true,
      validator: validatePw,
      trigger: 'blur'
    }
  ],
  pw2: [
    {
      required: true,
      validator: validatePw2,
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
      console.log(modelRef)
      const { pw } = modelRef
      const res: any = await putPw({ pw }, userStore.resetPwAccessToken)
      message.success('Reset success.')
      userStore.clearAll()
      emit('update:modelValue', false)

      // 重置表单
      formRef.value.resetFields()
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
  emit('update:modelValue', false)
}

// 处理Login moadal 返回操作，打开register modal
const handleBack = () => {
  handleClose()
  emit('back')
  // 返回，重置modal表单内容
  formRef.value.resetFields()
  formRef.value.clearValidate()
}
</script>

<template>
  <a-modal
    wrapClassName="custom-modal modal-reset"
    :destroy-on-close="true"
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
      <a-form-item label="Your password" name="pw">
        <a-input v-model:value="modelRef.pw" type="password" placeholder="Enter password" />
      </a-form-item>
      <a-form-item label="Confirm the new password" name="pw2">
        <a-input v-model:value="modelRef.pw2" type="password" placeholder="Enter password" />
      </a-form-item>
    </a-form>
    <div class="form-action">
      <div class="button button-primary" @click="onSubmit">Next</div>
    </div>
  </a-modal>
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
