<script lang="ts" setup>
import { gsap } from 'gsap'
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

const tl = gsap.timeline()

const handleAnimation = () => {
  tl.from('.boom-moments', {
    opacity: 0,
    delay: 2.33,
    ease: 'circ.out'
  })
    .from('.boom-moments__title', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'circ.out'
    })
    .from(
      '.boom-moments__content-left',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.29'
    )
    .from(
      '.boom-moments__content-right',
      {
        opacity: 0,
        y: 24,
        ease: 'circ.out'
      },
      '<=0.02'
    )
}

const dataAnimation = () => {
  tl.from(
    '.boom-moments__item',
    {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.1,
      ease: 'circ.out'
    },
    '<=0.13'
  )
}

watch(
  () => questStore.momentVideos.length,
  async () => {
    await nextTick()
    dataAnimation()
  }
)

onMounted(() => {
  handleAnimation()
})
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
  display: flex;
  padding: 0px 28px 16px 28px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;

  &__title {
    color: var(--color-primary);
    font-size: 28px;
    font-weight: 800;
    line-height: 36px;
    letter-spacing: -0.076px;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 20px;
    align-self: stretch;

    &-left {
      display: flex;
      align-items: center;
      height: calc(472.5 * (100vw - 592px) / 840);
      flex: 1;
      border-radius: 24px;
      overflow: hidden;

      .main-video {
        width: 100%;
        height: 100%;
      }
    }

    &-right {
      display: flex;
      padding: 16px;
      height: calc(472.5 * (100vw - 592px) / 840);
      align-items: flex-start;
      border-radius: 24px;
      background: #fff;
      overflow-y: auto;

      &-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        overflow-x: hidden;
      }
    }
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 272px;
    height: 173.678px;
    border-radius: 16px;
    overflow: hidden;
    box-sizing: border-box;
    flex-shrink: 0;
    cursor: pointer;

    &:hover {
      border: 2px solid #6e6e73;
    }

    &.active {
      border: 2px solid #1d1d1f;
    }

    img {
      width: 264px;
      height: 165px;
      border-radius: 12px;
      background: rgba(29, 29, 31, 0.5);
    }
  }
}

@media screen and (max-width: 1140px) {
  .boom-moments {
    &__content {
      flex-direction: column;

      &-right {
        padding: clamp(8px, 1.052vw, 12px);
        width: 100%;
        height: auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        overflow-x: auto;
        box-sizing: border-box;

        &-wrapper {
          flex-direction: row;
          overflow-x: auto;
          gap: 16px;
        }
      }
    }

    &__item {
      width: clamp(114px, 17.54vw, 200px);
      height: clamp(64px, 9.824vw, 112px);
      border-radius: 12px;
      border: 1px solid var(--8, rgba(255, 255, 255, 0.08));
      box-sizing: border-box;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}

@media screen and (max-width: 834px) {
  .boom-moments {
    padding: 0 clamp(16px, calc(28px - 12 / 459 * (834px - 100vw)), 28px) 16px;

    &__title {
      font-size: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);
    }

    &__content {
      gap: clamp(10px, calc(20px - 10 / 459 * (834px - 100vw)), 20px);
      &-left,
      &-right {
        border-radius: clamp(12px, calc(24px - 12 / 459 * (834px - 100vw)), 24px);
      }
    }
  }
}
</style>
