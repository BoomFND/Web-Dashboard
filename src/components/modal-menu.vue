<script lang="ts" setup>
import { useDownload } from '@/hooks/useDownload';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open'])

const onClose = () => {
  emit('update:open', false)
}

const changeTab = (tab: string) => {
  router.push(tab)
  emit('update:open', false)
}

const selectedKeys = ref<string[]>([])
const router = useRouter()

watch(
  () => router.currentRoute.value.path,
  (newV) => {
    if (newV.includes('campaign')) {
      selectedKeys.value = ['campaign']
    } else {
      selectedKeys.value = [newV.slice(1)]
    }
  }
)

const { handleDownload } = useDownload()
const download = () => {
  // 下载
  handleDownload()
}
</script>

<template>
  <a-drawer height="100%" width="212" placement="right" :closable="false" :open="open"
    :bodyStyle="{ padding: '28px 16px' }" @close="onClose">
    <div class="container">
      <div class="top-wrapper">
        <div class="button button-default btn-perception" :class="{ active: $route.name === 'Perceptron' }"
          @click="$router.push('/perceptron')">
          <SvgIcon name="header-perception" />
          <div class="text">Perceptron NFT</div>
        </div>

        <ConnectButton />
        <a-menu v-model:selectedKeys="selectedKeys" theme="light" mode="inline">
          <!-- <a-menu-item key="campaign" @click="$router.push('/campaign')">
            <template #icon>
              <SvgIcon name="aside-campaign" />
            </template>
<span>Campaign</span>
</a-menu-item> -->
          <a-menu-item key="quest" @click="changeTab('/quest')">
            <template #icon>
              <SvgIcon name="aside-quest" />
            </template>
            <span>Quest</span>
          </a-menu-item>
          <a-menu-item key="dashboard" @click="changeTab('/dashboard')">
            <template #icon>
              <SvgIcon name="aside-dashboard" />
            </template>
            <span>Mining</span>
          </a-menu-item>
          <a-menu-item key="leaderboard" @click="changeTab('/leaderboard')">
            <template #icon>
              <SvgIcon name="aside-leaderboard" />
            </template>
            <span>Leaderboard</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="bottom-wrapper">
        <div class="launch-button" :class="{ active: $route.name === 'launch' }" @click="download">
          <SvgIcon name="aside-download" />
          <span>Download Now</span>
        </div>
        <div class="social">
          <a href="https://t.me/GamerBoom_Official" target="_blank" class="wrapper">
            <SvgIcon name="social-tg" />
          </a>
          <a href="https://x.com/Gamerboom_" target="_blank" class="wrapper">
            <SvgIcon name="social-x" />
          </a>
          <a href="https://discord.com/invite/gamerboom" target="_blank" class="wrapper">
            <SvgIcon name="social-discord" />
          </a>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  .btn-perception {
    margin-bottom: 24px;
    height: 36px;
    padding: 0px 16px;

    .svg-icon {
      width: 20px;
      height: 20px;
    }

    .text {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.active,
    &:hover {
      color: #0ac2c2;
      border: 1px solid #0ac2c2;
      background: #fff;
    }
  }

  .connect-button {
    margin-bottom: 12px;
  }

  :deep(.ant-menu-light.ant-menu-root.ant-menu-inline) {
    border-inline-end: none;
  }

  :deep(.ant-menu-item) {
    display: flex;
    padding: 12px !important;
    align-items: center;
    align-content: center;
    // gap: 12px;
    border-radius: 80px;
    margin-block: 0;
    margin-inline: 0;
    margin-top: 24px;
    width: 100%;
    height: 48px;
    line-height: 48px;
    color: #6e6e73;
    font-size: var(--Font-size-14, 14px);
    font-style: normal;

    span {
      font-weight: 500;
      line-height: 24px;
      letter-spacing: var(--Letter-spacing-Letter-spacing, 0px);
    }

    .ant-menu-item-icon {
      width: 24px;
      height: 24px;
      font-size: 24px;
      line-height: 48px;
      flex-shrink: 0;
    }

    .ant-menu-title-content {
      margin-inline-start: 12px;
    }

    &:not(.ant-menu-item-selected):hover,
    &:not(.ant-menu-item-selected):active {
      color: #6e6e73;
      font-weight: 500;
      background: rgba(var(--color-background-rgb), 0.5);
    }

    &.ant-menu-item-selected {
      background: var(--color-background);
      color: var(--color-primary);

      span {
        font-weight: 700;
      }
    }
  }

  :deep(.ant-menu-inline-collapsed .ant-menu-item) {
    width: 48px;
  }

  .bottom-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 24px;

    .launch-button {
      position: relative;
      display: flex;
      padding: 12px;
      justify-content: center;
      align-items: center;
      align-content: center;
      border-radius: 80px;
      border: 1.5px solid var(--color-primary);
      height: 48px;
      line-height: 48px;
      font-size: var(--Font-size-14, 14px);
      font-style: normal;
      color: var(--color-primary);
      will-change: width, border-color, padding;
      transition:
        border-color 0.3s,
        width 0.2s cubic-bezier(0.645, 0.045, 0.355, 1),
        padding 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      cursor: pointer;
      overflow: hidden;

      span {
        margin-inline-start: 12px;
        white-space: nowrap;
        opacity: 1;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 111.111%;
        letter-spacing: 0px;
        flex: auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        will-change: opacity, color;
        transition:
          opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
          color 0.3s;
      }

      .svg-icon {
        display: block;
        margin-left: 2px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      &:hover,
      &.active {
        background: var(--color-primary);
        color: #fff;
      }

      &:active::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 80px;
        background: rgba(29, 29, 31, 0.16);
      }

      &.collapsed {
        span {
          opacity: 0;
        }

        width: 48px;
        overflow: hidden;
      }
    }

    .social {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 12px;

      .svg-icon {
        width: 24px;
        height: 24px;
        font-size: 24px;
        color: #6e6e73;

        &:hover {
          cursor: pointer;
          color: var(--color-primary);
        }
      }

      &.collapsed {
        flex-direction: column;
        gap: 42px;
      }
    }
  }
}
</style>