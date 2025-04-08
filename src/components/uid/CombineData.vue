<script setup lang="ts">
import { type NeedCombineAccount, useWalletStore } from '@/stores/wallet'
import type { Season } from '@/types/models'
import { CaretDownOutlined } from '@ant-design/icons-vue'
import { useNumberFormat } from '@/hooks/useNumberFormat'

const { formatNumber } = useNumberFormat()

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

const walletStore = useWalletStore()
// const accounts = ref<Array<NeedCombineAccount>>(walletStore.needCombineAccounts.sort((a, b) => b.points - a.points))
const accounts = computed(() => {
  return walletStore.needCombineAccounts.sort((a, b) => b.points - a.points)
})

const selectedIndex = ref(0)

const handleChange = (value: any) => {
  selectedIndex.value = value
}

const confirmAccount = () => {
  walletStore.confirmWalletAccount(accounts.value[selectedIndex.value].id)
  handleClose()
}
</script>

<template>
  <a-modal
    class="combine-data"
    ref="modalRef"
    v-model:open="showModal"
    :width="480"
    :footer="null"
    :closable="false"
    @cancel="handleClose"
  >
    <div class="header">
      <div class="title">Combine your data</div>
      <SvgIcon name="header-close" @click="handleClose()"></SvgIcon>
    </div>
    <section class="block">
      <div class="desc">
        It is detected that the wallet address is associated with multiple networks. To ensure the
        safety of your assets in the future, you need to choose a network data to save to your
        unique wallet address.
      </div>
      <div class="label">
        <div class="number">1</div>
        <div class="text">Please select the points you want to keep:</div>
      </div>
      <div class="select">
        <a-select v-model:value="selectedIndex" @change="handleChange">
          <a-select-option v-for="(item, index) in accounts" :key="index" :value="index">
            <div class="item">{{ formatNumber(item.points) }} GPT</div>
          </a-select-option>
          <template #suffixIcon><SvgIcon name="common-arrow-down"></SvgIcon></template>
        </a-select>
      </div>
      <div class="label">
        <div class="number">2</div>
        <div class="text">Please select the information you want to bind:</div>
      </div>
      <div class="select">
        <a-select v-model:value="selectedIndex" @change="handleChange">
          <a-select-option v-for="(item, index) in accounts" :key="index" :value="index">
            <div class="item">{{ item.email }}</div>
          </a-select-option>
          <template #suffixIcon><SvgIcon name="common-arrow-down"></SvgIcon></template>
        </a-select>
      </div>
      <div class="select">
        <a-select v-model:value="selectedIndex" @change="handleChange">
          <a-select-option v-for="(item, index) in accounts" :key="index" :value="index">
            <div class="item">
              <span style="margin-right: 8px; margin-top: -2px"
                ><SvgIcon name="uid-twitter"></SvgIcon
              ></span>
              {{ item.twitter ? '@' + item.twitter : item.twitter }}
            </div>
          </a-select-option>
          <template #suffixIcon><SvgIcon name="common-arrow-down"></SvgIcon></template>
        </a-select>
      </div>
      <div class="select">
        <a-select v-model:value="selectedIndex" @change="handleChange">
          <a-select-option v-for="(item, index) in accounts" :key="index" :value="index">
            <div class="item">
              <span style="margin-right: 8px; margin-top: -2px"
                ><SvgIcon name="uid-telegram"></SvgIcon
              ></span>
              {{ item.telegram ? 't.me/' + item.telegram : item.telegram }}
            </div>
          </a-select-option>
          <template #suffixIcon><SvgIcon name="common-arrow-down"></SvgIcon></template>
        </a-select>
      </div>
      <div class="select">
        <a-select v-model:value="selectedIndex" @change="handleChange">
          <a-select-option v-for="(item, index) in accounts" :key="index" :value="index">
            <div class="item">
              <span style="margin-right: 8px; margin-top: -2px"
                ><SvgIcon name="uid-discord"></SvgIcon
              ></span>
              {{ item.discord ? '@' + item.discord : item.discord }}
            </div>
          </a-select-option>
          <template #suffixIcon><SvgIcon name="common-arrow-down"></SvgIcon></template>
        </a-select>
      </div>
      <div class="action">
        <div class="tip">Once combined, the data that was not merged cannot be retrieved.</div>
        <div class="button" @click="confirmAccount()">Confirm Combine</div>
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

  .desc {
    color: var(--color-primary);
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 22px; /* 157.143% */
  }

  .label {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    .number {
      color: #fff;
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
      background: #0071e3;
    }

    .text {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 22px;
    }
  }

  .select {
    display: flex;
    width: 100%;

    .svg-icon {
      width: 10px;
      height: 10px;
    }

    :deep(.ant-select) {
      width: 100%;

      &:not(.ant-select-customize-input) {
        .ant-select-selector {
          border-radius: 40px;
          border: 1px solid rgba(29, 29, 31, 0.8);
          height: 44px;
          display: flex;
          padding: 0 16px 0 24px;
          justify-content: space-between;
          align-items: center;
          align-self: stretch;

          .ant-select-selection-search-input {
            width: 46px;
          }

          .ant-select-selection-item {
            color: #1d1d1f;
            text-align: left;
            font-feature-settings:
              'ss01' on,
              'cv01' on,
              'cv11' on;
            font-family: Urbanist;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            height: 44px;
            display: flex;
            align-items: center;
            gap: 8px;

            .svg-icon {
              width: 16px;
              height: 16px;
            }

            .item {
              height: 44px;
              line-height: 44px;
              display: flex;
              align-items: center;
            }
          }
        }

        .ant-select-arrow {
          font-size: 16px;
          right: 19px;
        }

        &:not(.ant-select-disabled):not(.ant-pagination-size-changer):hover .ant-select-selector {
          border-color: rgba(29, 29, 31, 0.8);
        }
      }
    }

    :deep(.ant-select-dropdown) {
      background: #191a27;
      box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);

      .ant-select-item-option {
        &-content {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(#1d1d1f, 0.5);

          .item {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .live {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 12px;
            flex-shrink: 0;
            border-radius: 2px;
            background: #00ffb4;
            font-size: 12px;
            color: #0f1017;
            text-align: center;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .hot {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 12px;
            flex-shrink: 0;
            border-radius: 2px;
            background: #ff5487;
            font-size: 12px;
            color: #0f1017;
            text-align: center;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }
        }

        &-active:not(.ant-select-item-option-disabled) {
          background-color: transparent;
          .ant-select-item-option-content {
            color: rgba(#1d1d1f, 0.7);
          }
        }

        &-selected:not(.ant-select-item-option-disabled) {
          background-color: transparent;
          .ant-select-item-option-content {
            color: #1d1d1f;
          }
        }
      }
    }

    :deep(.ant-dropdown) {
      .ant-dropdown-menu {
        .ant-dropdown-menu-item {
          padding: 16px 40px !important;

          .ant-dropdown-menu-title-content {
            color: var(--100, #fff);
            font-family: Urbanist;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 160%; /* 25.6px */
          }

          &.account-wrapper {
            .ant-dropdown-menu-title-content {
              display: flex;
              align-items: center;
              gap: 12px;
              align-self: stretch;
              flex: 1;

              .uid {
                color: #fff;
                font-family: Urbanist;
                font-size: 16px;
                font-style: normal;
                font-weight: 700;
                line-height: 160%; /* 25.6px */
              }

              .address {
                color: #00ffb4;
                font-family: Urbanist;
                font-size: 16px;
                font-style: normal;
                font-weight: 700;
                line-height: 160%;
              }
            }
          }
        }
      }
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
      color: #ffa800;
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
      background: #1d1d1f;
      color: #fff;
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
