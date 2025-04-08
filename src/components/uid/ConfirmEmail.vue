<script setup lang="ts">
import { confirmAddress } from '@/apis/uid'
import { connectWallet } from '@/services/NftService'
import { ref, watch } from 'vue';

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
  },
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  emit('update:modelValue', false)
}

const confirmAccount = () => {
  confirmAddress()
  connectWallet('metaMaskSDK')
  handleClose()
}
</script>

<template>
  <a-modal ref="modalRef" v-model:open="showModal" :width="480" :footer="null" :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="title">Bind the Wallet</div>
      <SvgIcon name="header-close" @click="handleClose()"></SvgIcon>
    </div>
    <section class="block">
      <div class="label">
        <div style="width: 20px">
          <div class="number">1</div>
        </div>
        <div class="text">It was detected that this address has been associated with other email addresses</div>
      </div>
      <div class="label">
        <div style="width: 20px">
          <div class="number">2</div>
        </div>
        <div class="text">Please confirm whether to bind this address</div>
      </div>
      <div class="label">
        <div style="width: 20px">
          <div class="number">3</div>
        </div>
        <div class="text">After binding, other associated email addresses will be unbound from this address.</div>
      </div>
      <div class="action">
        <div class="button" @click="confirmAccount()">Confirm and Connect Wallet</div>
      </div>
    </section>
  </a-modal>
</template>

<style lang="scss" scoped>
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;

  .title {
    color: var(--color-primary);
    font-size: 28px;
    font-weight: 800;
    line-height: 130%;
    letter-spacing: -0.56px;
    font-family: Urbanist;
    font-style: normal;
  }

  .svg-icon {
    width: 20px;
    height: 20px;
    color: var(--color-primary);
    flex-shrink: 0;
    cursor: pointer;
  }
}

.block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
  color: var(--color-primary);

  .label {
    display: flex;
    align-items: center;
    align-self: stretch;
    gap: 8px;

    .number {
      color: #FFF;
      text-align: center;
      font-family: Urbanist;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 14px;
      display: flex;
      width: 20px;
      height: 20px;
      justify-content: center;
      align-items: center;
      gap: 4px;
      border-radius: 40px;
      background: #0071E3;
    }

    .text {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 22px;
    }
  }

  .action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    align-self: stretch;
    margin-top: 16px;

    .tip {
      color: #FFA800;
      font-family: Urbanist;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
    }

    .button {
      display: flex;
      height: 44px;
      padding: 0px 40px;
      justify-content: center;
      align-items: center;
      align-self: stretch;
      border-radius: 80px;
      background: #1D1D1F;
      color: #FFF;
      font-family: Urbanist;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 24px;
      cursor: pointer;
    }
  }
}
</style>