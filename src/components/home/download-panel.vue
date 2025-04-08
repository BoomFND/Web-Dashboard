<script lang="ts" setup>
import { useDownload } from '@/hooks/useDownload'

// const { handleDownload, isLogined, hasAddress, remainingDownloads, totalDownloads } = useDownload()
const { showModal, handleDownload } = useDownload()
</script>

<template>
  <div class="download-panel">
    <div class="image-wrapper">
      <img src="@/assets/images/lol.png" />
    </div>
    <div class="right">
      <div class="genesis">
        <div class="title">Play now & earn</div>
        <!-- <div v-if="isLogined && hasAddress" class="content"> -->
        <div class="content">
          <div class="item" style="margin-top: 24px">
            <svg-icon name="home-checked-1" style="color: #70f1b4"></svg-icon>
            <div>click to download the APP</div>
          </div>
          <div class="item">
            <svg-icon name="home-checked-2" style="color: #e3405e"></svg-icon>
            <div>turn on APP while play the game</div>
          </div>
          <div class="item">
            <svg-icon name="home-checked-3" style="color: #f4dca5"></svg-icon>
            <div>Start to Play and Game Data Mining</div>
          </div>
        </div>
        <!-- <div v-else class="content">
          <div class="item" style="margin-top: 24px">
            <svg-icon name="home-checked-4" style="color: #ca59ff"></svg-icon>
            <div>
              After logging in and linking your wallet, you can download the desktop app to
              participate in the testing phase.
            </div>
          </div>
          <div class="item">
            <svg-icon name="home-checked-5" style="color: #10e4f4"></svg-icon>
            <div>
              Be quick—only 500 testing slots are available on a first-come, first-served basis.
            </div>
          </div>
        </div> -->
      </div>
      <!-- <div class="remind">
        {{ remainingDownloads }}/{{ totalDownloads }} Download Slots Remaining
      </div> -->
      <!-- <a-button
        class="button-download"
        shape="round"
        :disabled="remainingDownloads <= 0"
        ghost
        @click="handleDownload"
      > -->
      <a-button class="button-download" shape="round" ghost @click="handleDownload">
        Download APP & play
      </a-button>
      <div class="tip">Security Verification: Ensures safe and efficient game operation.</div>
    </div>
  </div>
  <modal-donwload-tip v-model="showModal"></modal-donwload-tip>
</template>

<style lang="scss" scoped>
.download-panel {
  margin-top: 36px;
  display: flex;
  width: 100%;
  padding: 24px;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  align-self: stretch;

  border-radius: 32px;
  border: 2px solid rgba(39, 43, 64, 0.36);
  background: rgba(20, 21, 31, 0.65);
  // box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);
  backdrop-filter: blur(20px);

  .image-wrapper {
    width: clamp(590px, 40.97vw, 920px);
    height: clamp(331.875px, 23.05vw, 517.5px);
    flex-shrink: 0;
    background: linear-gradient(359deg, rgba(0, 0, 0, 0.2) 25.01%, rgba(0, 0, 0, 0) 48.98%),
      linear-gradient(
        89deg,
        rgba(20, 21, 31, 0.94) 40.6%,
        rgba(20, 21, 31, 0.42) 69.85%,
        rgba(20, 21, 31, 0.12) 93.64%
      );
    border-radius: 36.169px;
    // filter: drop-shadow(0px 3px 8px rgba(0, 0, 0, 0.8));

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }

  .right {
    margin-left: 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .genesis {
      .title {
        color: #fff;
        font-size: 24px;
        font-style: normal;
        font-weight: 600;
        line-height: 120%; /* 28.8px */
        text-transform: uppercase;
        text-align: center;
      }

      .content {
        padding: 0 45px;
        .item {
          margin-top: 16px;
          display: flex;
          justify-content: flex-start;
          align-items: center;

          .svg-icon {
            width: 24px;
            height: 24px;
            margin-right: 6px;
            flex-shrink: 0;
          }

          div {
            flex: 1;
            color: rgba(255, 255, 255, 0.6);
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 120%; /* 19.2px */
            text-transform: lowercase;
          }
        }
      }
    }

    .remind {
      margin-top: 16px;
      font-size: 16px;
      font-weight: 700;
      line-height: 120%; /* 19.2px */
      text-transform: lowercase;
      color: #f4dca5;
    }

    .button-download {
      margin-top: 20px;
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
      width: 253px;
      height: 56px;
      position: relative;
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);

      color: #ffffff;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 19.2px */
      text-transform: uppercase;

      &.ant-btn-default:not(:disabled):active {
        opacity: 0.5;
      }
      &.ant-btn-default:not(:disabled):hover {
        opacity: 0.8;
      }

      &:disabled {
        // 不可点击状态的样式
        opacity: 0.3;
      }
    }

    .tip {
      margin-top: 7px;
      color: #3f4045;
      text-align: center;
      font-family: Quicksand;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 16.8px */
      text-transform: lowercase;
    }
  }
}

@media screen and (max-width: 1114px) {
  .download-panel {
    flex-direction: column;

    .image-wrapper {
      width: 100%;
      height: auto;
    }

    .right {
      align-items: flex-start;
      margin-left: 0;
      margin-top: 24px;
      width: 100%;

      .genesis {
        .title {
          text-align: left;
        }

        .content {
          padding-left: 0;
        }
      }
    }
  }
}
</style>
