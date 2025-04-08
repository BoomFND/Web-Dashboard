<script lang="ts" setup>
import { signGenesisProof } from '@/services/NftService'
import { useNftStore } from '@/stores/nft'
import { useWalletStore } from '@/stores/wallet'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'

// 定义双向绑定的modelValue
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const nftStore = useNftStore()

// 双向绑定，发送更新事件
const emit = defineEmits(['update:modelValue'])
const modalStore = useModalStore()
const userStore = useUserStore()

// 监听模态框可见性状态
watch(
  () => modalStore.isWelcomeModalVisible,
  (newVal) => {
    showModal.value = newVal
  }
)

// 通过watch监听modelValue，实现数据的修改
const showModal = ref(false)
// 监听isWelcomeModalSignUpMode状态来设置组件内部的isWelcomeModalSignUpMode
// signupmode是false是正常模式，提示他去sign genesis proof
// signupmode是true是注册模式，提示他去注册
const isWelcomeModalSignUpMode = ref(modalStore.isWelcomeModalSignUpMode)
watch(
  () => modalStore.isWelcomeModalSignUpMode,
  (newVal) => {
    isWelcomeModalSignUpMode.value = newVal
  }
)

watch(
  () => props.modelValue,
  (newV) => {
    showModal.value = newV
  }
)

const onCancel = () => {
  emit('update:modelValue', false)
  modalStore.toggleWelcomeModal(false) // 关闭模态框并重置isWelcomeModalSignUpMode
}

// 提交表单
const onSubmit = async () => {
  if (isWelcomeModalSignUpMode.value) {
    // 如果处于Sign Up模式，打开Sign Up模态框（这里假设你有一个方法来处理这个逻辑）
    emit('update:modelValue', false) // 先关闭当前模态框
    modalStore.toggleRegisterModal(true) // 打开登录模态框
    console.log('Open Sign Up modal here')
  } else {
    const walletStore = useWalletStore()
    const nftId = 2 // 假设你已经有了一个NFT ID
    const success = await signGenesisProof(nftId, nftStore)
    if (success) {
      walletStore.updateSignedGenesisProof(true)
      console.log('success')
      modalStore.toggleWelcomeModal(false)
      if (!userStore.account.username) {
        // 如果用户未登录，打开注册模态框
        modalStore.toggleRegisterModal(true)
      }
    } else {
      // 可能需要处理用户取消或失败的情况
    }
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <a-modal
    wrapClassName="modal-welcome"
    ref="modalRef"
    width="408px"
    v-model:open="showModal"
    :footer="null"
    @cancel="onCancel"
  >
    <template #title>
      <div>Welcome to Our Genesis Testing</div>
    </template>
    <div class="content">
      <p>Calling All Visionary Gamers!</p>
      <p>
        By entering, you'll join us for a wildly unique Web3 gaming experience – a test like no
        other. Indeed, this is a daring genesis test, where we've decided to push the envelope and
        go live with an early version.
      </p>
      <p>
        We are on the hunt for warriors with a taste for the novel, ready to dive into a gaming
        product test that promises chaos but guarantees a one-of-a-kind experience. Our test is
        laden with opportunities, but only the truly visionary will reap the rewards.
      </p>
      <p v-if="isWelcomeModalSignUpMode">
        Ready to mint? Let's start by creating an account. Let's $BOOM together!
      </p>
      <p v-else>Ready for the challenge? Visit our website, sign up, and let's $BOOM together!</p>
    </div>
    <div class="actions">
      <a-button class="button-ghost" shape="round" ghost @click="onCancel">
        No, Registered
      </a-button>
      <!-- 根据isWelcomeModalSignUpMode来决定按钮的文案 -->
      <a-button class="button-ghost button-green" shape="round" ghost @click="onSubmit">
        {{ isWelcomeModalSignUpMode ? 'Yes, Sign Up' : 'Yes, Register!' }}
      </a-button>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  padding: 24px 30px 30px;
  p + p {
    margin-top: 20px;
  }
}

.actions {
  padding: 24px 30px 30px;
  display: flex;
  border-top: 1px solid rgba(39, 43, 64, 0.8);

  .button-ghost + .button-ghost {
    margin-left: 10px;
  }

  .button-ghost {
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
    font-size: 14px;
    line-height: 120%;
    font-weight: 700;
  }

  .button-green {
    border: 1px solid #00ffb4;
  }
}
</style>

<style lang="scss">
.modal-welcome {
  .ant-modal {
    .ant-modal-content .ant-modal-header .ant-modal-title {
      font-size: 16px;
      color: rgba(255, 255, 255);
      text-transform: capitalize;
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
