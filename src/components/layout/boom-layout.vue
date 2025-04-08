<script lang="ts" setup></script>

<template>
  <div class="layout">
    <header v-if="$slots.header" class="layout-header">
      <slot name="header"></slot>
    </header>
    <section class="container">
      <aside v-if="$slots.sider" class="layout-sider"><slot name="sider"></slot></aside>
      <section class="layout-main">
        <main v-if="$slots.content" class="layout-content"><slot name="content"></slot></main>
      </section>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  position: relative;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  max-width: 1920px;
  min-height: 100vh;
  &::before {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    margin: 0 auto;
    width: 1372px;
    height: 771.68px;
    background-image: url('@/assets/images/bg.png');
    background-position: right top;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: right top;
    // background-attachment: fixed;
  }

  .layout-header {
    position: fixed;
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
  }

  .container {
    position: relative;
    display: flex;
    padding: 0 60px;
    min-height: 100vh;

    .layout-sider {
      position: fixed;
      top: 60px;
      z-index: 8;
      display: flex;
      width: 135px;
      min-height: 960px;
      overflow: hidden;
    }

    .layout-main {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 60px 0 60px 195px;
      overflow: hidden;
    }

    .layout-content {
      flex: 1;
      // min-height: 654px;
    }

    .layout-content,
    .layout-footer {
      color: #fff;
    }
  }
}
</style>
