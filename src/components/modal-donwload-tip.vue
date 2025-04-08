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
  emit('update:modelValue', false)
  donwload()
}

// 提交表单
const onSubmit = async () => {
  emit('update:modelValue', false) // 立即关闭模态窗口
}
</script>

<template>
  <a-modal
    wrapClassName="modal-download-tip"
    ref="modalRef"
    width="688px"
    v-model:open="showModal"
    :footer="null"
    @cancel="onCancel"
  >
    <template #title>Registration Prompt</template>
    <div class="content">
      <p>To access the desktop app, you need an email account. Please register an email account.</p>
    </div>
    <div class="actions">
      <a-button class="button-ghost later" shape="round" ghost @click="onCancel">
        Later, Download First
      </a-button>
      <!-- 根据isWelcomeModalSignUpMode来决定按钮的文案 -->
      <a-button class="button-ghost button-green" shape="round" ghost @click="onSubmit">
        Register Account
      </a-button>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  padding: 16px 0;
}

.actions {
  padding: 24px 0 0;
  display: flex;
  border-top: 1px solid rgba(39, 43, 64, 0.8);

  .button-ghost + .button-ghost {
    margin-left: 24px;
  }

  .button-ghost {
    display: flex;
    height: 48px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex: 1 0 0;
    border-radius: 32px;
    border: 1px solid var(--60, rgba(255, 255, 255, 0.6));
    background: var(--4, rgba(255, 255, 255, 0.04));

    color: var(--60, rgba(255, 255, 255, 0.6));
    text-align: center;
    font-family: Quicksand;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 24px */
  }

  .later {
    border-radius: 32px;
    border: 1px solid var(--60, rgba(255, 255, 255, 0.6));
    background: var(--4, rgba(255, 255, 255, 0.04));
  }

  .button-green {
    border: 1px solid #00ffb4;
    background: rgba(0, 255, 180, 0.1);
    color: #00ffb4;
  }

  @media screen and (max-width: 530px) {
    flex-direction: column;
    gap: 20px;

    .button-ghost + .button-ghost {
      margin-left: 0px;
    }
  }
}
</style>

<style lang="scss">
.modal-download-tip {
  .ant-modal {
    .ant-modal-content {
      padding: 24px;

      .ant-modal-header {
        padding: 0 0 16px;
        height: auto;
        border-bottom: 2px solid rgba(255, 255, 255, 0.04);

        .ant-modal-title {
          color: var(--100, #fff);
          font-family: Quicksand;
          font-size: 24px;
          font-style: normal;
          font-weight: 700;
          line-height: 26px; /* 81.25% */
        }
      }
    }

    .ant-modal-content .ant-modal-body {
      padding: 0;
      color: var(--60, rgba(255, 255, 255, 0.6));
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 160%; /* 32px */
    }
  }
}
</style>
