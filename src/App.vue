<script setup lang="ts">
import dayjs from 'dayjs'
import type { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useNftStore } from '@/stores/nft'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useLoginTipStore } from '@/stores/tip'
import ModalWelcome from '@/components/modal-welcome.vue'
import type BoomHeaderWap from './components/boom-header-wap.vue'

const nftStore = useNftStore()
const walletStore = useWalletStore()
const userStore = useUserStore()
const loginTipStore = useLoginTipStore()

const isModalVisible = ref(false) // 定义一个响应式变量控制模态框的显示
const isTaskModalVisible = ref(false) // 定义一个响应式变量控制模态框的显示
const isBitlayerModalVisible = ref(false) // 定义一个响应式变量控制模态框的显示
// const isWukongModalVisible = ref(false)

onMounted(() => {
  const isWelcomeShow = sessionStorage.getItem('isWelcomeShow')
  sessionStorage.removeItem('isWelcomeShow')

  nftStore.fetchWalletInfo() // 组件挂载时调用
  if (!walletStore.wallet.chainId && isWelcomeShow !== 'false') {
    // 如果用户没有sign过，自动显示模态框
    isModalVisible.value = true
  }

  // 进入页面要看一下是否要显示任务提示
  showTip()

  // // 判断是否要显示首次引导弹窗
  isBitlayerModalVisible.value = true
  // isWukongModalVisible.value = true
})

// 任务提示
const showTip = async () => {
  // 判断用户是否已登录
  if (!userStore.accessToken) return
  await loginTipStore.getTips()

  // 判断弹窗是否已经弹过，并且判断是否是当天弹的
  if (
    loginTipStore.remind[loginTipStore.type].finished &&
    loginTipStore.remind[loginTipStore.type].time === dayjs().format('YYYY-MM-DD')
  )
    return
  isTaskModalVisible.value = true
  // 设置已经提示过
  loginTipStore.setRemind()
}

// 监听用户将网站切换到前台
document.addEventListener('visibilitychange', function () {
  !document.hidden && showTip()
})
</script>

<template>
  <section class="page-view">
    <header class="layout-header">
      <boom-header />
      <BoomHeaderWap />
    </header>
    <section class="container">
      <!-- <modal-welcome v-model:modelValue="isModalVisible" /> -->
      <!-- <modal-task v-model="isTaskModalVisible" /> -->
      <ModalBitlayer v-model="isBitlayerModalVisible"></ModalBitlayer>
      <!-- <modal-wukong v-model="isWukongModalVisible"></modal-wukong> -->
      <aside class="layout-sider"><boom-sider /></aside>
      <section class="layout-main">
        <main class="layout-content"><RouterView></RouterView></main>
        <footer class="layout-footer"><boom-footer /></footer>
      </section>
    </section>
  </section>
</template>
<style lang="scss">
.page-view {
  position: relative;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  max-width: 1920px;
  min-height: 100vh;
  &::before {
    content: '';
    position: absolute;
    margin: 0 auto;
    width: 100%; //1181px;
    height: min(62.71vw, 100%);
    background-image: url('@/assets/images/bg_header.png');
    background-position: left top;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: left top;
    background-attachment: fixed;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    margin: 0 auto;
    width: 100%;
    height: min(46.67vw, 100%);
    background-image: url('@/assets/images/bg_footer.png');
    background-position: left top;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: left bottom;
    // background-attachment: fixed;
    z-index: -2;
  }

  .layout-header {
    position: sticky;
    top: 0;
    z-index: 9;
    display: flex;
    width: 100%;
    height: 94px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: #fff;
    // background-color: red;
    background-color: #14151f;
    background-size: contain;
    background-position: left top;
    overflow: hidden;

    @media (max-width: 1280px) {
      padding: 10px 32px;
    }

    @media (max-width: 600px) {
      height: 164px;
      .header-pc {
        display: none;
      }

      .header-wap {
        display: flex;
      }
    }

    @media (min-width: 601px) {
      .header-pc {
        display: flex;
      }

      .header-wap {
        display: none;
      }
    }

    @media (min-width: 1281px) {
      padding: 10px calc((100% - 1200px) / 2);
    }

    @media (min-width: 1441px) {
      padding: 10px 120px;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 62.71vw;
      background-image: url('@/assets/images/bg_header.png');
      background-position: left top;
      background-repeat: no-repeat;
      background-size: 100%;
      z-index: -1;
    }
  }

  .container {
    position: relative;
    display: flex;

    @media (max-width: 1280px) {
      padding: 0 24px;
    }

    @media (min-width: 1281px) {
      padding: 0 calc((100% - 1200px) / 2);
    }

    @media (min-width: 1441px) {
      padding: 0 120px;
    }

    .layout-sider {
      position: sticky;
      top: 94px;
      z-index: 8;
      height: calc(100vh - 94px);
      overflow: hidden;

      color: #fff;
      transition:
        width 0.5s ease,
        margin-right 0.5s ease;

      @media (max-width: 1280px) {
        width: 0;
        margin-right: 0;
      }

      @media (min-width: 1281px) {
        margin-right: 24px;
        margin-right: 16px;
        width: 104px;
        min-width: 104px;
        max-width: 104px;
      }
    }

    .layout-main {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .layout-content {
      flex: 1;
      min-height: 654px;
    }

    .layout-footer {
      position: relative;
      padding: 0;
    }

    .layout-content {
      overflow: hidden;
    }

    .layout-content,
    .layout-footer {
      color: #fff;
    }
  }
}
</style>
