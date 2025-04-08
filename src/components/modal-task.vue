<script lang="ts" setup>
import { useLoginTipStore } from '@/stores/tip'

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
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  emit('update:modelValue', false)
}

const tipStore = useLoginTipStore()
</script>

<template>
  <a-modal
    wrapClassName="modal-task"
    ref="modalRef"
    v-model:open="showModal"
    :footer="null"
    width="408px"
    @cancel="handleClose"
  >
    <template #title>
      <div>{{ tipStore.title }}</div>
    </template>
    <div class="list">
      <template v-if="tipStore.type === Object.keys(tipStore.remind)[0]">
        <div class="item" v-for="(tip, index) in tipStore.tips" :key="tip.id">
          <svg-icon :name="`task-${index + 1}`"></svg-icon>
          <div class="value">{{ tip.value }}</div>
        </div>
      </template>
      <template v-else>
        <div class="item" v-for="(tip, index) in tipStore.tips" :key="tip.id">
          <svg-icon :name="`task-${4 + index}`"></svg-icon>
          <div class="value">{{ tip.value }}</div>
        </div>
      </template>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.list {
  .item {
    display: flex;
    align-items: center;
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    word-wrap: break-word;
    padding: 0 15px;

    height: 60px;

    .svg-icon {
      margin-right: 14px;
      font-size: 28px;
    }

    &:not(:last-child) {
      padding: 0 8px;
      border-bottom: 1px solid rgba(39, 43, 64, 0.8);
      .svg-icon {
        margin-right: 8px;
        font-size: 44px;
      }
    }
  }
}
</style>
<style lang="scss">
.modal-task {
  .ant-modal {
    .ant-modal-content .ant-modal-header .ant-modal-title {
      color: #838383;
      font-size: 16px;
      font-weight: 700;
      text-transform: capitalize;
      word-wrap: break-word;
    }

    .ant-modal-content .ant-modal-body {
      padding: 0;
      color: #838383;
      font-size: 12px;
      font-weight: 700;
      line-height: 140%;
    }
  }
}
</style>
