<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { ref, watch } from 'vue'

const userStore = useUserStore()
const walletStore = useWalletStore()

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
const logout = () => {
  userStore.clearAll()
  emit('update:modelValue', false)
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
</script>

<template>
  <a-modal wrapClassName="no-padding" v-model:open="showModal" :footer="null" width="563px" @cancel="handleClose">
    <template #title>
      <div>MY GAMERBOOM</div>
    </template>

    <div class="content">
      <div class="left">
        <div>{{ `User ID: ${userStore.account.username}` }}</div>
        <div>{{ `User Name: ${userStore.account.name}` }}</div>
        <div>{{ `Wallet: ${formatAddress(walletStore.wallet.address ?? '--')}` }}</div>
      </div>
      <div class="right">
        <div class="avatar-wrap">
          <div>Edit your avatar (optional)</div>
          <boom-avatar :src="userStore.account.avatar" :username="userStore.account.name" :size="71"
            :color="userStore.avatarColor"></boom-avatar>
        </div>
      </div>
    </div>
    <a-row class="actions">
      <a-button class="button-logout" shape="round" ghost @click="logout">Log Out</a-button>
    </a-row>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  padding: 24px 30px 30px;
  display: flex;
  color: #838383;
  font-family: Urbanist;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%;
  /* 16.8px */
  border-bottom: 1px solid rgba(39, 43, 64, 0.8);

  .left {
    width: 348px;

    div+div {
      margin-top: 38px;
    }
  }

  .right .avatar-wrap {
    width: 125px;

    .avatar {
      margin-top: 25px;
    }
  }
}

.actions {
  padding: 14px 30px 30px;
  display: flex;
  justify-content: flex-end;
}

.button-logout {
  text-align: right;
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

.ant-modal .ant-modal-content .ant-modal-body {
  padding: 0;
}
</style>