<script lang="ts" setup>
import { useDownload } from '@/hooks/useDownload'

const { donwload } = useDownload()

// 定义双向绑定的modelValue
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 通过watch监听modelValue，实现数据的修改
const showModal = ref(false)

watch(
  () => props.modelValue,
  (newV) => {
    showModal.value = newV
  }
)

const onCancel = () => {
  showModal.value = false
  emit('update:modelValue', false)
}

// 提交表单
const onSubmit = async () => {
  showModal.value = false
  emit('update:modelValue', false) // 立即关闭模态窗口
  donwload()
}
</script>

<template>
  <a-modal
    wrapClassName="custom-modal modal-bind-error"
    ref="modalRef"
    v-model:open="showModal"
    :width="480"
    :footer="null"
    :closable="false"
    @cancel="onCancel"
  >
    <div class="header">
      <div class="title"></div>
      <SvgIcon name="header-close" @click="onCancel" />
    </div>
    <div class="content">
      No client detected, please download first.
    </div>
    <div class="footer">
      <div class="button button-default" @click="onCancel">Cancel</div>
      <div class="button button-primary" @click="onSubmit">Download</div>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  margin-top: -24px;
  font-size: 20px;
}

.footer {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
