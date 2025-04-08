<script lang="ts" setup></script>

<template>
  <div class="footer">
    <div class="notes">© 2024 GamerBoom</div>
    <div class="list">
      <!-- <div class="item">About</div>
      <div class="item">Support</div>
      <div class="item">Contact Us</div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  display: flex;
  width: 100%;
  height: 42px;
  padding: 8px 28px;
  justify-content: space-between;
  align-items: center;
  background: #fafafc;

  .notes {
    color: rgba(29, 29, 31, 0.4);
    font-feature-settings:
      'ss01' on,
      'cv01' on,
      'cv11' on;
    font-family: Urbanist;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 150%;
  }

  .list {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 4px;
  }

  .item {
    padding: 4px 8px;
    color: rgba(29, 29, 31, 0.4);
    font-feature-settings:
      'ss01' on,
      'cv01' on,
      'cv11' on;
    font-family: Urbanist;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 150%;
    cursor: pointer;
  }
}

@media screen and (min-width: 1921px) {
  .footer {
    height: calc(42 * 100vw / 1920);
    padding: calc(8 * 100vw / 1920) calc(28 * 100vw / 1920);

    .notes {
      font-size: calc(12 * 100vw / 1920);
    }

    .list {
      gap: calc(4 * 100vw / 1920);
    }

    .item {
      padding: calc(4 * 100vw / 1920) calc(8 * 100vw / 1920);
      font-size: calc(12 * 100vw / 1920);
    }
  }
}
</style>
