<script setup lang="ts">
import { confirmAddress } from '@/apis/uid'
import { connectWallet } from '@/services/NftService'
import { useModalStore, type ConnectWalletType } from '@/stores/modal'
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()

// 通过watch监听modelValue，实现数据的修改
const showModal = ref(false)
const walletType = ref<ConnectWalletType | null>(null)

watch(
  () => props.modelValue,
  (newV) => {
    showModal.value = newV
  },
)

const modalStore = useModalStore()

watch(
  () => modalStore.isConnectWalletVisible,
  (newVal) => {
    showModal.value = newVal
  }
)

watch(
  () => modalStore.connectWalletType,
  (newVal) => {
    walletType.value = newVal
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  modalStore.toggleLoginEntryModal(false)
  emit('update:modelValue', false)
}

const bindWallet = (type?: ConnectWalletType) => {
  if (!type) {
    connectWallet('metaMaskSDK')
  } else {
    modalStore.toggleLoginEntryModal(true);
    modalStore.setLoginEntryType(type);
    modalStore.setLoginEntryConnectType('connect');
  }
  handleClose()
}
</script>

<template>
  <a-modal ref="modalRef" v-model:open="showModal" :width="480" :footer="null" :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="title">Connect Wallet First</div>
      <SvgIcon name="header-close" @click="handleClose()"></SvgIcon>
    </div>
    <section class="block" v-if="!walletType">
      <div class="label">
        <div style="width: 20px">
          <div class="number">1</div>
        </div>
        <div class="text">Can not create account before connect Wallet. </div>
      </div>
      <div class="label">
        <div style="width: 20px">
          <div class="number">2</div>
        </div>
        <div class="text">After creating an account through a linked wallet, you can bind your email or social media to
          log in.</div>
      </div>
      <div class="action">
        <div class="button" @click="bindWallet()">Connect Wallet</div>
      </div>
    </section>

    <section class="block" v-if="walletType === 'evm'">
      <div class="label">
        <div class="text">Can not participate in the EVM quests before connect EVM Wallet. </div>
      </div>
      <div class="action">
        <div class="button" @click="bindWallet('evm')">Connect Wallet</div>
      </div>
    </section>

    <section class="block" v-if="walletType === 'solana'">
      <div class="label">
        <div class="text">Can not participate in the Solana quests before connect Solana Wallet. </div>
      </div>
      <div class="action">
        <div class="button" @click="bindWallet('solana')">Connect Wallet</div>
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