<script lang="ts" setup></script>

<template>
  <section class="dashboard-view">
    <MyGamePoints />
    <!-- <DownloadPanel /> -->
    <RewardPanel />
  </section>
</template>

<style lang="scss" scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
  padding-bottom: 38px;
}

@media screen and (min-width: 1921px) {
  .dashboard-view {
    gap: calc(24 * 100vw / 1920);
    padding-bottom: calc(38 * 100vw / 1920);
  }
}

@media screen and (max-width: 834px) {
  .dashboard-view {
    gap: clamp(16px, calc(24px - 8 / 459 * (834px - 100vw)), 24px);
  }
}
</style>
