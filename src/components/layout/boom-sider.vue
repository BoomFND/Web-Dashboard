<script lang="ts" setup>
import { useDownload } from '@/hooks/useDownload'

const route = useRoute()
const router = useRouter()

const currentRouteName = ref()
watch(
  () => route.name,
  (name) => {
    currentRouteName.value = name
  }
)

const navs = ref([
  {
    name: 'dashboard',
    icon: 'aside-dashboard',
    active: 'aside-dashboard_light',
    text: 'Dashboard'
  },
  {
    name: 'play',
    icon: 'aside-play',
    active: 'aside-play_light',
    text: 'Play'
  },
  {
    name: 'referral',
    icon: 'aside-referral',
    active: 'aside-referral',
    text: 'Referral'
  },
  {
    name: 'rewards',
    icon: 'aside-rewards',
    active: 'aside-rewards',
    text: 'Rewards'
  }
])

const handleClick = (name: string) => {
  currentRouteName.value = name
  router.push({ name })
}

const goWebsite = (name: string) => {
  currentRouteName.value = name
  window.open('https://www.gamerboom.org/', '_black')
}

const { handleDownload } = useDownload()
const download = (name: string) => {
  currentRouteName.value = name
  // 下载
  handleDownload()
}
</script>
<template>
  <div class="side-bar">
    <div class="top">
      <div class="brand">
        <svg-icon name="logo" />
      </div>

      <div class="wrapper">
        <div
          :class="['item', currentRouteName === item.name ? 'active' : '']"
          v-for="item in navs"
          :key="item.name"
          @click="handleClick(item.name)"
        >
          <svg-icon :name="currentRouteName === item.name ? item.active : item.icon" />
          <div class="text">{{ item.text }}</div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="download">
        <svg-icon name="aside-windows"></svg-icon>
        <div class="text">Download</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.side-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  border-radius: 32px;
  background: #090c0f;
  overflow: hidden;
  gap: max(300px, calc(100vh - 940px));

  .top,
  .bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .brand {
    margin-top: 40px;
    width: 100%;
    height: 64px;
    cursor: pointer;

    .svg-icon {
      width: 100%;
      height: 100%;
    }
  }

  .wrapper {
    margin-top: 100px;

    .item {
      width: 100%;
      height: 64px;
      color: #8d8d8d;
      text-align: center;
      font-family: Urbanist;
      cursor: pointer;

      .svg-icon {
        width: 40px;
        height: 40px;
      }

      .text {
        margin-top: 8px;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px; /* 142.857% */
      }

      &:not(:first-child) {
        margin-top: 80px;
      }

      &.active,
      &:active,
      &:hover {
        color: #fff;
      }
    }
  }

  .download {
    margin-bottom: 18px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    border-radius: 16px;
    background: #fff;
    cursor: pointer;

    .svg-icon {
      width: 32px;
      height: 32px;
    }

    .text {
      margin-top: 8px;
      color: #0f1012;
      text-align: center;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 800;
      line-height: 20px; /* 142.857% */
    }
  }
}
</style>
