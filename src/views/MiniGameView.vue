<script lang="ts" setup>
const handlePlay = async () => {
  window.open('https://t.me/capybara_taptap_community', '_blank')
  // window.open('https://t.me/Capybara_TapTap_bot?start=1', '_blank')
}
</script>

<template>
  <a-carousel adaptive-height>
    <div class="item">
      <div class="left">
        <img src="@/assets/images/mini-game.gif" />
      </div>
      <div class="right">
        <div class="title">Capybara TapTap Game</div>
        <!-- <div class="sub-title"></div> -->
        <div class="wrapper">
          <ul class="desc">
            <li>Tap to Win: Hit the capybara, relieve stress, and earn coins with every tap!</li>
            <li>Invite Friends: Bring your crew along for extra fun and more rewards.</li>
            <li>Daily Challenges: Complete daily goals to score bigger with special airdrops.</li>
          </ul>
          <div class="sub">Get ready, get set, tap! Capybara Guild is here for you!</div>
        </div>

        <a-button class="button-mint" shape="round" ghost @click="handlePlay">
          <span>play & EARN now!</span>
        </a-button>
      </div>
    </div>
  </a-carousel>
</template>

<style lang="scss" scoped>
:deep(.slick-slide) {
  text-align: center;
  height: 654px;
  overflow: hidden;

  @media screen and (max-width: 1140px) {
    height: 1000px;
  }

  .item {
    display: flex !important;
    align-items: center;
    height: 584px;
    overflow: hidden;

    .left {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: clamp(580px, calc(580px + 0.125 * (100vw - 1440px)), 640px);
      height: 580px;
      background: rgba(20, 21, 31, 0.65);
      border-radius: 32px;
      border: 2px solid rgba(39, 43, 64, 0.36);
      flex-shrink: 0;

      img {
        width: 302px;
        height: 416px;
        object-fit: cover;
        object-position: center;
      }
    }

    .right {
      display: inline-flex;
      margin-left: 24px;
      width: clamp(474px, calc(100% - 2px), 896px);
      height: 580px;
      padding: 24px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 29px;

      border-radius: 32px;
      border: 2px solid rgba(39, 43, 64, 0.36);
      background: rgba(20, 21, 31, 0.65);
      // box-shadow: 0px 0px 5px 0px rgba(40, 43, 65, 0.65);
      // backdrop-filter: blur(20px);

      // .wrapper {
      //   width: 100%;
      //   text-align: left;
      // }

      .title {
        color: #fff;
        font-size: 32px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 38.4px */
        text-transform: uppercase;
      }

      .sub-title {
        color: #11c5c5;
        font-size: 20px;
        font-weight: 700;
        line-height: 120%; /* 24px */
        text-transform: uppercase;
      }

      .desc {
        color: rgba(255, 255, 255, 0.6);
        // padding-bottom: 29px;
        font-size: 16px;
        text-align: left;
        font-weight: 700;
        line-height: 160%;
        padding-left: 30px;
      }

      .sub {
        width: 100%;
        color: rgba(255, 255, 255, 0.6);
        padding-bottom: 29px;
        font-size: 16px;
        text-align: left;
        font-weight: 700;
        line-height: 160%;
        border-bottom: 2px solid rgba(39, 43, 64, 0.36);
      }

      .progress-wrap {
        padding: 24px 0;
        width: 100%;

        .top-info {
          display: flex;
          justify-content: space-between;

          div {
            &:first-child {
              color: rgba(255, 255, 255, 0.6);

              font-size: 24px;
              font-style: normal;
              font-weight: 700;
              line-height: 120%; /* 28.8px */
              text-transform: uppercase;
            }

            &:last-child {
              color: #11c5c5;

              font-family: Quicksand;
              font-size: 24px;
              font-style: normal;
              font-weight: 700;
              line-height: 120%; /* 28.8px */
            }
          }
        }

        .ant-progress-line {
          margin-top: 12px;

          .ant-progress-outer {
            margin-inline-end: 0;
            padding-inline-end: 0;
          }

          .ant-progress-inner {
            background: rgba(255, 255, 255, 0.1);
          }

          .ant-progress-bg {
            background: #11c5c5;
          }

          .ant-progress-text {
            display: none;
          }
        }

        .bottom-info {
          margin-top: 12px;
          display: flex;
          justify-content: space-between;

          color: #11c5c5;

          font-family: Quicksand;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: 120%; /* 16.8px */
          // text-transform: uppercase;

          .bt-right {
            span:last-child {
              color: rgba(17, 197, 197, 0.6);
            }
          }
        }
      }

      .button-mint {
        display: flex;
        height: 56px;
        padding: 10px 20px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        align-self: stretch;

        font-size: 16px;
        font-weight: 700;
        text-transform: uppercase;
        line-height: 120%; /* 19.2px */
        color: #ffffff;
        border-radius: 48px;
        border: 1px solid #fff;
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);

        // &.ant-btn-default:not(:disabled):active,
        // &.ant-btn-default:not(:disabled):hover {
        //   color: #f4dca5;
        //   border-color: #f4dca5;
        // }

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

      .tips {
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 14.4px */
        text-transform: lowercase;
      }
    }
  }

  @media screen and (max-width: 1140px) {
    .item {
      flex-direction: column;
      height: auto;
      gap: 24px;

      .left {
        width: 100%;
        height: auto;
      }
      .right {
        width: calc(100% - 4px);
        height: auto;
        margin: 0;
      }
    }
  }
}

:deep(.slick-arrow.custom-slick-arrow) {
  width: 60px;
  height: 60px;
  font-size: 60px;
  color: rgba(#ffffff, 0.9);
  background-color: rgba(31, 45, 61, 0.11);
  transition: ease all 0.3s;
  opacity: 0.9;
  z-index: 1;
}
:deep(.slick-arrow.custom-slick-arrow:before) {
  display: none;
}
:deep(.slick-arrow.custom-slick-arrow:hover) {
  color: #fff;
  opacity: 0.5;
}
</style>
