<script lang="ts" setup>
import { gsap } from 'gsap'
import { useUserStore } from '@/stores/user'
import { usePointsStore } from '@/stores/points'
import { onMounted, ref, watch } from 'vue';

interface Props {
  modelValue: boolean
}
withDefaults(defineProps<Props>(), {
  modelValue: false
})

const global = useUserStore()
const emit = defineEmits(['update:modelValue'])

const isMenuShow = ref(false)
const openMenu = () => {
  isMenuShow.value = true
}

const openWebsite = () => {
  window.open(import.meta.env.VITE_APP_WEB, '_blank')
}

const headerAnimation = () => {
  gsap.from(['.ant-layout-header', '.w-header'], {
    opacity: 0,
    y: -24,
    duration: 0.8,
    ease: 'power1.inOut'
  })
}

onMounted(async () => {
  headerAnimation()
  // 刷新页面，重新请求更新用户数据，(主要用于，Join Discord后，无法通知网站更新用户数据，所以允许用户手动刷新页面)
  global.fetchAccountInfo()
})

const pointsStore = usePointsStore()
Promise.all([pointsStore.fetchSeasons(), pointsStore.getCurrentSeason()])

// 监听用户登录，登录后，要请求我的游戏数据
watch(
  () => global.accessToken,
  (newV) => {
    if (newV) {
      pointsStore.getGamePoints()
    }
  }
)

// 监听赛季变化，更新我的排名
watch(
  () => pointsStore.currentSeason,
  (newVal) => {
    if (!newVal || !global.accessToken) return
    pointsStore.getGamePoints()
  }
)
</script>

<template>
  <div class="header">
    <a-layout-header>
      <div class="header-left">
        <div class="trigger-wrapper">
          <SvgIcon class="trigger" v-if="!modelValue" name="header-fold"
            @click="() => emit('update:modelValue', !modelValue)" />
          <SvgIcon class="trigger" v-else name="header-unfold" @click="() => emit('update:modelValue', !modelValue)" />
        </div>
        <SvgIcon class="logo" name="aside-logo-fold" @click="openWebsite" />
        <div class="season-select">
          <SeasonSelect />
        </div>
        <BoomPoints class="ranking-view" />
      </div>
      <div class="header-right">
        <div class="button button-default btn-perception" :class="{ active: $route.name === 'Perceptron' }"
          @click="$router.push('/perceptron')">
          <SvgIcon name="header-perception" />
          <div class="text">Perceptron NFT</div>
        </div>
        <ConnectButton class="connect-button" />
        <div class="w-nav-menu" @click="openMenu">
          <SvgIcon name="header-menu" />
        </div>
      </div>
    </a-layout-header>

    <div class="w-header">
      <div class="w-header-top">
        <SvgIcon name="aside-logo-fold" @click="openWebsite" />
        <SvgIcon name="header-menu" @click="openMenu" />
      </div>
      <div class="w-header-center">
        <SeasonSelect />
      </div>
      <div class="w-header-bottom">
        <BoomPoints class="ranking-view" />
      </div>
    </div>
    <modal-menu v-model:open="isMenuShow"></modal-menu>
  </div>
</template>

<style lang="scss" scoped>
.ant-layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  height: 86px;
  line-height: 100%;
  background: #fafafc;

  .trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .logo {
    display: none;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 32px;

    .season-select {
      width: 300px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .btn-perception {
      // width: 130px;
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

    .ranking-view {
      margin-right: 60px;
    }

    .connect-button {
      width: 156px;
    }

    .w-nav-menu {
      display: none;

      .svg-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }
    }
  }
}

.w-header {
  display: none;
}

@media screen and (min-width: 1921px) {
  .ant-layout-header {
    padding: calc(16 * 100vw / 1920) calc(28 * 100vw / 1920);
    height: calc(86 * 100vw / 1920);

    .trigger {
      width: calc(24 * 100vw / 1920);
      height: calc(24 * 100vw / 1920);
    }

    .header-left {
      gap: calc(32 * 100vw / 1920);

      .season-select {
        width: calc(300 * 100vw / 1920);
      }
    }

    .header-right {
      gap: calc(24 * 100vw / 1920);

      .btn-perception {
        height: calc(36 * 100vw / 1920);
        padding: 0px calc(16 * 100vw / 1920);

        .svg-icon {
          width: calc(20 * 100vw / 1920);
          height: calc(20 * 100vw / 1920);
        }
      }

      .ranking-view {
        margin-right: calc(60 * 100vw / 1920);
      }

      .connect-button {
        width: calc(156 * 100vw / 1920);
      }
    }
  }
}

@media screen and (max-width: 1350px) {
  .ant-layout-header {
    .trigger-wrapper {
      display: none;
    }

    .logo {
      display: block;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }

    .header-left {
      gap: clamp(24px, calc(32px - 8 / 446 * (1280px - 100vw)), 32px);
    }

    .header-right {
      gap: clamp(24px, calc(32px - 8 / 446 * (1280px - 100vw)), 32px);

      .ranking-view {
        margin-right: 0;
      }

      .connect-button {
        display: none;
      }

      .btn-perception {
        display: none;
      }

      .w-nav-menu {
        display: block;
      }
    }
  }
}

@media screen and (max-width: 834px) {
  .ant-layout-header {
    display: none;
  }

  .w-header {
    display: flex;
    width: 100%;
    padding: 16px clamp(16px, calc(28px - 12 / 459 * (834px - 100vw)), 28px);
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    background: #fafafc;

    &-top,
    &-center,
    &-bottom {
      width: 100%;
    }

    &-top {
      display: flex;
      justify-content: space-between;

      .svg-icon {
        width: 24px;
        height: 24px;
      }
    }

    :deep(.points-wrapper) {
      width: 100%;

      .left,
      .right {
        flex: 1;
      }
    }
  }
}
</style>