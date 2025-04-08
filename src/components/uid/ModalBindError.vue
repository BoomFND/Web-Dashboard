<script lang="ts" setup>
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()

const showModal = ref(false)

watch(
  () => props.modelValue,
  (newV) => {
    showModal.value = newV
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  emit('update:modelValue', false)
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
    @cancel="handleClose"
  >
    <div class="header">
      <div class="title">Failed to Bind SOL Address</div>
      <SvgIcon name="header-close" @click="$emit('update:modelValue', false)" />
    </div>
    <div class="content">
      <p>
        This SOL address has already been used to create an account. Please try binding a different
        SOL address.
      </p>
    </div>
    <div class="footer">
      <div class="button button-primary" @click="handleClose">OK</div>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  margin-top: -24px;
}

.footer {
  width: 100%;
}
</style>
