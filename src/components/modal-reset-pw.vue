<script lang="ts" setup>
import { putAccount } from '@/apis/index'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'

const { setAccount } = useUserStore()

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
      const res: any = await putAccount({ pw })
      setAccount(res)
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
  <a-modal :destroy-on-close="true" v-model:open="showModal" :footer="null" @cancel="handleClose">
    <a-form ref="formRef" layout="vertical" :rules="rules" :model="modelRef">
      <a-form-item label="Your password" name="pw">
        <a-input v-model:value="modelRef.pw" type="password" placeholder="Enter password" />
      </a-form-item>
      <a-form-item label="Confirm the new password" name="pw2">
        <a-input v-model:value="modelRef.pw2" type="password" placeholder="Enter password" />
      </a-form-item>
      <a-form-item style="margin-top: 25px">
        <a-row>
          <a-col :span="14"> </a-col>
          <a-col :span="10" style="text-align: right">
            <a-button class="button-create" shape="round" ghost @click="onSubmit">Reset</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>

    <template #title>
      <div class="title-wrapper">
        <svg-icon name="arrow-left" @click="handleBack"></svg-icon>
        <div class="title">RESET PASSWORD</div>
      </div>
    </template>
  </a-modal>
</template>

<style lang="scss" scoped>
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
