<script lang="ts" setup>
import { useQuestStore } from '@/stores/quest'
import type { Moment } from '@/types/models'

const questStore = useQuestStore()

questStore.getBoomMoments()

const currentVideo = ref<Moment>(questStore.momentVideos[0] || {})

watch(
  () => questStore.momentVideos.length,
  (newV) => {
    if (!newV) return
    currentVideo.value = questStore.momentVideos[0]

    if (videoRef.value) {
      videoRef.value?.load()
    }
  }
)

const videoRef = ref<HTMLVideoElement | null>(null)

const handleClick = (item: Moment) => {
  currentVideo.value = item

  if (videoRef.value) {
    videoRef.value?.pause()
    videoRef.value?.load()
    videoRef.value?.play()
  }
}
</script>

<template>
  <div class="boom-moments">
    <div class="boom-moments__title">Highlights from Past Seasons</div>
    <div class="boom-moments__content">
      <div class="boom-moments__content-left">
        <video ref="videoRef" class="main-video" controls>
          <source :src="currentVideo.videoUrl" :type="currentVideo.type" />
        </video>
      </div>
      <div class="boom-moments__content-right">
        <div class="boom-moments__content-right-wrapper">
          <div
            class="boom-moments__item"
            :class="{ active: currentVideo.id === item.id }"
            v-for="item in questStore.momentVideos"
            :key="item.id"
            @click="handleClick(item)"
          >
            <img :src="item.coverUrl" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.boom-moments {
  width: 100%;

  &__title {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    line-height: normal;
    text-transform: capitalize;
  }

  &__content {
    margin-top: 16px;
    display: flex;
    padding: 24px;
    align-items: stretch;
    gap: 24px;
    border-radius: 32px;
    background: #191a27;
    width: 100%;

    &-left {
      border-radius: 8px;
      overflow: hidden;
      flex: 1;

      .main-video {
        width: 100%;
        height: 100%;
      }
    }

    &-right {
      display: flex;
      flex-direction: column;
      padding: 12px 8px;
      border-radius: 24px;
      background: var(--2, rgba(255, 255, 255, 0.02));
      overflow-y: auto;

      &-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0 4px;
        gap: 12px;
        overflow-x: hidden;

        &::-webkit-scrollbar {
          width: 4px;
        }
        &::-webkit-scrollbar-track {
          border-radius: 10px;
          background: var(--4, rgba(255, 255, 255, 0.04));
        }
        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background: var(--60, rgba(255, 255, 255, 0.6));
        }
      }
    }
  }

  &__item {
    width: 200px;
    height: 112px;
    border-radius: 12px;
    border: 1px solid var(--8, rgba(255, 255, 255, 0.08));
    background: #050814;
    overflow: hidden;
    box-sizing: content-box;
    flex-shrink: 0;
    cursor: pointer;

    &.active {
      border: 2px solid var(--60, rgba(255, 255, 255, 0.6));
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }

  @media screen and (min-width: 1281px) {
    &__content {
      height: clamp(462px, calc(40.314375vw - 118.5px), 732px);
    }
  }

  @media screen and (max-width: 1280px) {
    &__content {
      height: max(calc((100vw - 404px) / 1.78 + 48px), 462px);
    }
  }

  @media screen and (max-width: 1140px) {
    &__content {
      flex-direction: column;
      height: auto;

      &-right {
        display: flex;
        padding: clamp(8px, 1.052vw, 12px);
        align-items: flex-start;
        gap: 12px;
        overflow-x: auto;
        box-sizing: border-box;

        &-wrapper {
          flex-direction: row;
        }

        &::-webkit-scrollbar {
          height: 4px;
        }
        &::-webkit-scrollbar-track {
          border-radius: 10px;
          background: var(--4, rgba(255, 255, 255, 0.04));
        }
        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background: var(--60, rgba(255, 255, 255, 0.6));
        }
      }
    }

    &__item {
      width: clamp(114px, 17.54vw, 200px);
      height: clamp(64px, 9.824vw, 112px);
      border-radius: 12px;
      border: 1px solid var(--8, rgba(255, 255, 255, 0.08));
      box-sizing: border-box;
    }
  }
}
</style>
