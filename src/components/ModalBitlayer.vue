<script lang="ts" setup>
import { signGenesisProof } from '@/services/NftService'
import { useNftStore } from '@/stores/nft'
import { useWalletStore } from '@/stores/wallet'
import { notification } from 'ant-design-vue'
import SvgIcon from '@/components/commons/SvgIcon.vue'
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
  },
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
            style: { 'margin-bottom': '0', width: 0 },
          },
          '',
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
              'margin-left': '0',
            },
          },
          'On-Chain Check-In Successfully!',
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
        width: '311px',
      },
      duration: 2,
      icon: () =>
        h(SvgIcon, {
          name: 'checked',
          style: { width: '24px', height: '24px', marginTop: '20px', color: '#70F1B4' },
        }),
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
    wrapClassName="custom-modal modal-bitlayer"
    ref="modalRef"
    width="480px"
    v-model:open="showModal"
    :footer="null"
    :closable="false"
    @cancel="onCancel"
  >
    <div class="header">
      <div class="title">MVB Season Guide</div>
      <SvgIcon name="header-close" @click="$emit('update:modelValue', false)"></SvgIcon>
    </div>
    <div class="content">
      <div class="item">
        <div class="index">1</div>
        <div class="text">Daily check-in and claim the Season Pass for free, do social quests.</div>
      </div>
      <div class="item">
        <div class="index">2</div>
        <div class="text">Mint the Epic Gold Shovel for game arena access.</div>
      </div>
      <div class="item">
        <div class="index">3</div>
        <div class="text">Download the client and play games like LOL or Epic for airdrops.</div>
      </div>
    </div>
    <div class="button button-primary" @click="onSubmit">Daily Check-In</div>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;

  .item {
    display: flex;
    align-items: center;
    gap: 8px;

    .index {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      border-radius: 100% 100%;
      background: #0071e3;
      color: #fff;
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      line-height: 14px;
    }
  }
}
</style>
