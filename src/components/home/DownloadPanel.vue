<script lang="ts" setup>
import { gsap } from 'gsap'
const handleAnimation = () => {
  const tl = gsap.timeline()
  tl.from(
    '.download-panel',
    {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'circ.out',
      delay: 1.2
    },
    '<=0.1'
  )
    .from(
      '.download-panel .title',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out',
        delay: 0.4
      },
      '<=0.1'
    )
    .from(
      '.download-panel .desc',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.1'
    )
    .from(
      '.download-panel .content',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.1'
    )
    .from(
      '.download-panel .content .left .item',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'circ.out'
      },
      '<=0.1'
    )
    .from(
      '.download-panel .content .right .app',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'circ.out'
      },
      '<=0.1'
    )
    .from(
      '.download-panel .content .right .pc',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'circ.out'
      },
      '<=0.1'
    )
}

onMounted(() => {
  handleAnimation()
})
</script>

<template>
  <div class="download-panel">
    <div>
      <div class="title">Play Now & Earn</div>
      <div class="desc">Security verification: ensuring safe and efficient game operation.</div>
    </div>

    <div class="content">
      <div class="left">
        <div class="list">
          <div class="item">
            <SvgIcon name="dashboard-finished" />
            <div class="text">Click "Download Now" in the left menu bar to proceed.</div>
          </div>
          <div class="item">
            <SvgIcon name="dashboard-finished" />
            <div class="text">Open the GamerBoom desktop app before launching the game.</div>
          </div>
          <div class="item">
            <SvgIcon name="dashboard-finished" />
            <div class="text">Start playing and enjoy game data mining!</div>
          </div>
        </div>
      </div>
      <div class="right">
        <img class="app" src="@/assets/images/app.png" alt="" />
        <img class="pc" src="@/assets/images/lol.png" alt="" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-panel {
  display: flex;
  padding: 16px 28px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;

  .title {
    color: #1d1d1f;
    font-family: Urbanist;
    font-size: 32px;
    font-style: normal;
    font-weight: 800;
    line-height: 125%;
    letter-spacing: -0.076px;
  }

  .desc {
    margin-top: 8px;
    color: #1d1d1f;
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 157.143%;
  }

  .content {
    display: flex;
    width: 100%;
    padding: 16px 24px;
    justify-content: space-between;
    align-items: center;
    border-radius: 16px;
    background: #fff;

    .left {
      width: 590px;
    }

    .list {
      display: flex;
      padding-left: 24px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 24px;
      flex-shrink: 0;

      .item {
        display: flex;
        align-items: center;
        gap: 12px;

        .svg-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .text {
          color: #1d1d1f;
          font-family: Urbanist;
          font-size: 18px;
          font-style: normal;
          font-weight: 800;
          line-height: 144.444%;
          letter-spacing: 0.196px;
        }
      }
    }

    .right {
      position: relative;
      flex-shrink: 0;

      img {
        display: block;
      }

      .pc {
        width: 345px;
        height: 200px;
        flex-shrink: 0;
      }

      .app {
        position: absolute;
        top: 20px;
        left: -46px;
        height: 160px;
        z-index: 1;
      }
    }
  }
}

@media screen and (min-width: 1921px) {
  .download-panel {
    padding: calc(16 * 100vw / 1920) calc(28 * 100vw / 1920);
    gap: calc(24 * 100vw / 1920);

    .title {
      font-size: calc(32 * 100vw / 1920);
    }

    .desc {
      margin-top: calc(8 * 100vw / 1920);
      font-size: calc(14 * 100vw / 1920);
    }

    .content {
      padding: calc(16 * 100vw / 1920) calc(24 * 100vw / 1920);
      border-radius: calc(16 * 100vw / 1920);

      .left {
        width: calc(590 * 100vw / 1920);
      }

      .list {
        padding-left: calc(24 * 100vw / 1920);
        gap: calc(24 * 100vw / 1920);

        .item {
          gap: calc(12 * 100vw / 1920);

          .svg-icon {
            width: calc(20 * 100vw / 1920);
            height: calc(20 * 100vw / 1920);
          }

          .text {
            font-size: calc(18 * 100vw / 1920);
          }
        }
      }

      .right {
        .pc {
          width: calc(345 * 100vw / 1920);
          height: calc(200 * 100vw / 1920);
        }

        .app {
          top: calc(20 * 100vw / 1920);
          left: calc(-46 * 100vw / 1920);
          height: calc(160 * 100vw / 1920);
        }
      }
    }
  }
}

@media screen and (max-width: 1280px) {
  .download-panel .content .right .app {
    display: none;
  }
}

@media screen and (max-width: 880px) {
  .download-panel {
    .content {
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;

      .list {
        padding-left: 0;
      }

      .right {
        display: flex;
        justify-content: flex-start;
        width: min(100%, 345px);
      }
    }
  }
}

@media screen and (max-width: 834px) {
  .download-panel {
    padding: 16px clamp(16px, calc(24px - 8 / 459 * (834px - 100vw)), 24px);

    .title {
      font-size: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);
    }

    .desc {
      font-size: clamp(12px, calc(14px - 2 / 459 * (834px - 100vw)), 14px);
    }

    .content {
      .left {
        width: 100%;
      }

      .right .pc {
        width: 100%;
        height: auto;
      }
    }
  }
}
</style>
