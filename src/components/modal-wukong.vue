<script lang="ts" setup>
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
}
</script>

<template>
  <a-modal
    wrapClassName="modal-wukong"
    ref="modalRef"
    width="520px"
    v-model:open="showModal"
    :footer="null"
    @cancel="onCancel"
  >
    <template #title>MVB Season - Quick Start </template>
    <div class="content">
      <div class="box">
        <div class="sub-title">
          <div class="index">1</div>
          Mint Passcard
        </div>
        <div class="desc">Launch home page and mint Epic Gold Shovel.</div>
      </div>
      <div class="box">
        <div class="sub-title">
          <div class="index">2</div>
          Sign Up & Install
        </div>
        <div class="desc">Create an account and download the GamerBoom app.</div>
      </div>
      <div class="box">
        <div class="sub-title">
          <div class="index">3</div>
          Complete Social Tasks
        </div>
        <div class="desc">Finish social tasks during the download and start to earn.</div>
      </div>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  padding: 16px 0;

  .box {
    margin-top: 16px;

    .sub-title {
      display: flex;
      align-items: center;
      color: #ffca47;
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 160%; /* 25.6px */

      .index {
        margin-right: 8px;
        display: inline-flex;
        width: 16px;
        height: 16px;
        padding: 0px 4px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        border-radius: 8px;
        background: #ffca47;
        color: #191a28;
        font-family: Quicksand;
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        line-height: 160%; /* 19.2px */
      }
    }

    .desc {
      padding-left: 24px;
      margin-top: 4px;
      color: var(--60, rgba(255, 255, 255, 0.6));
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 160%; /* 25.6px */
    }
  }
}
</style>

<style lang="scss">
.modal-wukong {
  .ant-modal {
    .ant-modal-content {
      padding: 24px;

      .ant-modal-header {
        padding: 0 0 16px;
        height: auto;
        border-bottom: 2px solid rgba(255, 255, 255, 0.04);

        .ant-modal-title {
          padding-right: 18px;
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
