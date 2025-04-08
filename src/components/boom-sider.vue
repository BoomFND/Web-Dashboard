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
      <div
        :class="['item', 'item-nft', currentRouteName === 'nft' ? 'active' : '']"
        @click="handleClick('nft')"
      >
        <svg-icon name="nft" class="icon-nft" />
        <div class="text">Campaign</div>
      </div>
      <div
        :class="['item', 'item-quest', currentRouteName === 'quest' ? 'active' : '']"
        @click="handleClick('quest')"
      >
        <svg-icon name="quest" class="icon-quest" />
        <div class="text">Social Tasks</div>
      </div>
      <!-- <div
        :class="['item', 'item-mini-game', currentRouteName === 'miniGame' ? 'active' : '']"
        @click="handleClick('miniGame')"
      >
        <svg-icon name="vector" class="icon-nft" />
        <div class="text">Mini Game</div>
      </div> -->
      <div
        :class="['item', 'item-home', currentRouteName === 'dashboard' ? 'active' : '']"
        @click="handleClick('dashboard')"
      >
        <svg-icon name="home" class="icon-home" />
        <div class="text">Dashboard</div>
      </div>
      <div
        class="item"
        :class="['item', 'item-rank', currentRouteName === 'leaderboard' ? 'active' : '']"
        @click="handleClick('leaderboard')"
      >
        <svg-icon name="rank" class="icon-rank" />
        <div class="text">Leaderboard</div>
      </div>
    </div>
    <div class="bottom">
      <div
        :class="['item', 'item-net', currentRouteName === 'net' ? 'active' : '']"
        @click="goWebsite('net')"
      >
        <svg-icon name="net" class="icon-net" />
        <div class="text">Home</div>
      </div>
      <div
        :class="['item', 'item-download', currentRouteName === 'download' ? 'active' : '']"
        @click="download('download')"
      >
        <svg-icon name="download" class="icon-download" />
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
  min-height: calc(100vh - 286px);

  .top,
  .bottom {
    width: 100%;
    border-top: 2px solid rgba(39, 43, 64, 0.36);
  }

  .item {
    border-radius: 24px;
    padding: 8px 0px 8px 0px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    flex-shrink: 0;
    height: 96px;
    cursor: pointer;

    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 1);
    opacity: 0.4;

    .svg-icon {
      font-size: 28px;
    }

    .text {
      line-height: 16px;
      white-space: nowrap;
    }

    &:hover {
      opacity: 0.6;
    }

    &:visited {
      opacity: 0.8;
    }

    &:active,
    &.active {
      opacity: 1;

      &.item-nft {
        color: #00ffb4;
      }

      &.item-mini-game {
        color: #ff5487;
      }

      &.item-quest {
        color: #10e4f4;
      }

      &.item-home {
        color: #ffca47;
      }

      &.item-rank {
        color: #ca59ff;
      }

      &.item-net {
        color: #fff;
      }

      &.item-download {
        color: #8faadc;
      }
    }
  }
}
</style>
