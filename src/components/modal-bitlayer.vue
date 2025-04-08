<script lang="ts" setup>
import { signGenesisProof } from '@/services/NftService'
import { useNftStore } from '@/stores/nft'
import { useWalletStore } from '@/stores/wallet'
import { notification } from 'ant-design-vue'
import SvgIcon from './svg-icon.vue'
import { message } from 'ant-design-vue'

// 定义双向绑定的modelValue
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const nftStore = useNftStore()

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

// 提交表单
const onSubmit = async () => {
  emit('update:modelValue', false) // 立即关闭模态窗口
  const walletStore = useWalletStore()
  const nftId = 8 // 假设你已经有了一个NFT ID
  const success = await signGenesisProof(nftId, nftStore)
  if (success) {
    notification.open({
      message: () =>
        h(
          'div',
          {
            style: { 'margin-bottom': '0', width: 0 }
          },
          ''
        ),
      description: () =>
        h(
          'div',
          {
            style: {
              color: '#fff',
              'font-size': '20px',
              'font-weight': 700,
              'line-height': '160%',
              'margin-inline-start': '17px',
              'margin-left': '0'
            }
          },
          'On-Chain Check-In Successfully!'
        ),
      closeIcon: () =>
        h(SvgIcon, { name: 'close', style: { width: '24px', height: '24px', marginTop: '20px' } }),
      style: {
        display: 'inline-flex',
        padding: '24px 14px 24px 24px',
        alignItems: 'center',
        background: '#191A28',
        border: '2px solid rgba(39, 43, 64, 0.36)',
        'border-radius': '24px',
        width: '311px'
      },
      duration: 2,
      icon: () =>
        h(SvgIcon, {
          name: 'checked',
          style: { width: '24px', height: '24px', marginTop: '20px', color: '#70F1B4' }
        })
    })
    walletStore.updateSignedGenesisProof(true)
    console.log('success')
    const nftStore = useNftStore()
    // TODO: 跳转到mint SBTs的页面
  } else {
    // TODO: 可能需要处理用户取消或失败的情况
    // Please manually switch to the opBNB network.
    message.error('Please manually switch to the opBNB network.')
  }
}
</script>

<template>
  <a-modal
    wrapClassName="modal-bitlayer"
    ref="modalRef"
    width="488px"
    v-model:open="showModal"
    :footer="null"
    @cancel="onCancel"
  >
    <template #title>MVB Season Guide </template>
    <div class="content">
      <ol>
        <li>Daily check-in and claim the Season Pass for free, do social quests.</li>
        <li>Mint the Epic Gold Shovel for game arena access.</li>
        <li>Download the client and play games like LOL or Epic for airdrops.</li>
      </ol>
    </div>
    <div class="actions">
      <!-- <a-button class="button-ghost later" shape="round" ghost @click="onCancel"> Later </a-button> -->
      <!-- 根据isWelcomeModalSignUpMode来决定按钮的文案 -->
      <a-button class="button-ghost button-green" shape="round" ghost @click="onSubmit">
        Daily Check-In
      </a-button>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  padding: 16px 0;

  ol {
    padding-left: 30px;
  }
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
}
</style>

<style lang="scss">
.modal-bitlayer {
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
