<script lang="ts" setup>
const router = useRouter()

const goDoc = () => {
  window.open('https://gamerboom.gitbook.io/gamerboom-docs/', '_black')
}

const goTwitter = () => {
  window.open('https://twitter.com/Gamerboom_', '_black')
}

const goMedium = () => {
  window.open('https://medium.com/@gamerboom', '_black')
}

const goHome = () => {
  router.push({ name: 'nft' })
}
</script>
<template>
  <div class="footer-wrapper">
    <div class="footer-top">
      <div class="f-left">
        <div class="item" @click="goHome">
          <svg-icon name="logo-round"></svg-icon>
          GamerBoom
        </div>
        <div class="text">All Rights Reserved.</div>
      </div>
      <div class="f-right">
        <div class="column">
          <div class="about">ABOUT</div>
          <div class="docs" @click="goDoc">docs</div>
        </div>
        <div class="column">
          <div class="social">SOCIAL MEDIA</div>
          <div class="twitter" @click="goTwitter">
            <svg-icon name="twitter"></svg-icon>
            Twitter
          </div>
          <div class="medium" @click="goMedium"><svg-icon name="medium"></svg-icon>medium</div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">@ 2024 | GamerBoom, Inc</div>
  </div>
</template>

<style lang="scss" scoped>
.footer-top {
  display: flex;
  justify-content: space-between;
  padding: 68px 0;

  .f-left {
    .item {
      display: flex;
      align-items: center;
      color: #f3f3f3;

      font-family: Quicksand;
      font-size: 19.379px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-transform: capitalize;
      cursor: pointer;

      .svg-icon {
        margin-top: 2px;
        margin-right: 8px;
        width: 18.083px;
        height: 18.084px;
      }
    }

    .text {
      margin-top: 12px;
      color: var(--BAI, #fff);

      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 150%; /* 24px */
      opacity: 0.6;
    }
  }

  .f-right {
    display: flex;

    .column + .column {
      margin-left: 64px;
    }

    .social,
    .about {
      margin-bottom: 24px;
      color: rgba(255, 255, 255, 0.8);
      -webkit-text-stroke-width: 1;
      -webkit-text-stroke-color: #000;
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 150%; /* 24px */
    }

    .docs {
      color: rgba(255, 255, 255, 0.8);
      -webkit-text-stroke-width: 1;
      -webkit-text-stroke-color: #000;
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 150%; /* 24px */
      text-transform: capitalize;
      opacity: 0.6;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }

    .twitter,
    .medium {
      color: rgba(255, 255, 255, 0.8);
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 150%; /* 24px */
      text-transform: capitalize;
      opacity: 0.6;
      cursor: pointer;

      .svg-icon {
        margin-right: 5px;
        opacity: 1;
        color: #fff;
      }

      &:hover {
        opacity: 1;
      }
    }

    .medium {
      margin-top: 12px;
      .svg-icon {
        margin-right: 10px;
      }
    }
  }
}

@media screen and (max-width: 479px) {
  .footer-top {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    align-self: stretch;
    padding: 32px 0 24px;

    .f-left {
      .text {
        font-size: 14px;
      }
    }

    .f-right {
      display: flex;
      align-items: flex-start;
      gap: 32px;
      align-self: stretch;

      .about,
      .social {
        margin-bottom: 12px;
      }
    }
  }
}

.footer-bottom {
  display: flex;
  padding: 0px 120px 48px 120px;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
  border-top: 2px solid rgba(39, 43, 64, 0.36);

  color: rgba(255, 255, 255, 0.8);
  -webkit-text-stroke-width: 1;
  -webkit-text-stroke-color: #000;
  font-family: Quicksand;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 24px */
  opacity: 0.6;
}
</style>
