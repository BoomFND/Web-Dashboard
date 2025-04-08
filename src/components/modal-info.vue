<script lang="ts" setup>
import { getAccount, putAccount } from '@/apis/index'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'

const { setAccount, setAvatarColor } = useUserStore()

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
    fetchAccount()
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 表单属性
const modelRef = reactive({
  name: '',
  pw: '',
  avatar: ''
})

// 校验规则
const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: 'Please input the correct name',
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
      const res: any = await putAccount(toRaw(modelRef))
      setAccount(res)
      // 没有上传头像，则设置一下头像颜色
      !modelRef.avatar && setAvatarColor()
      emit('update:modelValue', false)
    })
    .catch((err: any) => {
      console.log('error', err)
      if (err.detail) {
        message.error(err.detail, 5)
      }
    })
}

const email = ref('')
const fetchAccount = async () => {
  try {
    const { name, username }: any = await getAccount()
    modelRef.name = name
    email.value = username
  } catch (error) {
    console.error(error)
  }
}

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  emit('update:modelValue', false)
}

const avatar = ref()
const handleChange = async (file: string) => {
  modelRef.avatar = file
}
</script>

<template>
  <a-modal ref="modalRef" v-model:open="showModal" :footer="null" @cancel="handleClose">
    <a-form ref="formRef" layout="vertical" :rules="rules" :model="modelRef">
      <a-row>
        <a-col :span="14">
          <a-form-item label="Set username" name="name">
            <a-input
              v-model:value="modelRef.name"
              placeholder="Type your name"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item label="Set password" name="pw">
            <a-input
              type="password"
              v-model:value="modelRef.pw"
              placeholder="Enter your password"
            />
          </a-form-item>
        </a-col>
        <a-col class="upload-wrap" :span="10">
          <a-form-item label="Upload your Avatar image here(optional)">
            <boom-upload v-model:avatar="avatar" @change="handleChange"></boom-upload>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item style="margin-top: 25px">
        <a-row>
          <a-col :span="14" style="display: flex; align-items: center">
            <div class="text">{{ `User ID: ${email}` }}</div>
          </a-col>
          <a-col :span="10" style="text-align: right">
            <a-button class="button-create" shape="round" ghost @click="onSubmit">Start</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>

    <template #title>
      <div>Verification successful</div>
    </template>
  </a-modal>
</template>

<style lang="scss" scoped>
.upload-wrap {
  padding-left: 30px;

  .upload-wrapper {
    margin-top: 30px;
  }
}

.text {
  color: #838383;
  text-align: left;
  font-family: 'Quicksand-Bold', sans-serif;
  font-size: 14px;
  line-height: 120%;
  font-weight: 700;
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
}
</style>
