<script setup lang="ts">
import { type ConnectWalletType, useModalStore } from '@/stores/modal'
import { useAccount } from '@wagmi/vue'
import { ref, watch } from 'vue'
import { useWallet as useSolanaWallet } from 'solana-wallets-vue'
import { useUserStore } from '@/stores/user'

interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()

// 通过watch监听modelValue，实现数据的修改
const showModal = ref(false)
const switchAddressType = ref<ConnectWalletType | null>(null)

watch(
  () => props.modelValue,
  (newV) => {
    showModal.value = newV
  },
)

const modalStore = useModalStore()

watch(
  () => modalStore.isSwitchAddressVisible,
  (newVal) => {
    showModal.value = newVal
  }
)
watch(
  () => modalStore.switchAddressType,
  (newVal) => {
    switchAddressType.value = newVal
  }
)

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])

// 关闭modal，发送事件
const handleClose = () => {
  showModal.value = false
  modalStore.toggleSwitchAddressModal(false)
  emit('update:modelValue', false)
}

const userStore = useUserStore()
const account = useAccount()
const {
  publicKey,
} = useSolanaWallet()
</script>

<template>
  <a-modal ref="modalRef" v-model:open="showModal" :width="480" :footer="null" :closable="false" @cancel="handleClose">
    <div class="header">
      <div class="title">Bind the Wallet</div>
      <SvgIcon name="header-close" @click="handleClose()"></SvgIcon>
    </div>
    <section class="block">
      <div class="label" v-if="switchAddressType === 'evm'">
        <div class="text">The address linked to your account does not match
          what you are using now({{ account.address?.value?.toString() }}).<br />
          Please switch to the address you are binding to your account.({{ userStore.account.walletAddress }})
        </div>
      </div>

      <div class="label" v-else-if="switchAddressType === 'solana'">
        <div class="text">The address linked to your account does not match
          what you are using now({{ publicKey?.toBase58() }}).<br />
          Please switch to the address you are binding to your account({{ userStore.account.solanaAddress }}).
        </div>
      </div>

      <div class="label" v-else>
        <div class="text">The address linked to your account does not match
          what you are using now.<br />
          Please switch to the address you are binding to your account.
        </div>
      </div>
      <div class="action">
        <div class="button" @click="handleClose()">OK</div>
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