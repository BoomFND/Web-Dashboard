<script lang="ts" setup>
import { useQuestStore } from '@/stores/quest'
import type { SharingTask } from '@/types/models'

const questStore = useQuestStore()

const carouselRef = ref()
const index = ref(0)

const carouselsWrapRef = ref()
const carouselWidth = ref(0)
const slidesCount = ref(0)

watch(
  () => carouselWidth.value,
  (newV) => {
    if (!newV) return
    slidesCount.value = carouselWidth.value / 328
  }
)

// 适配小屏幕，修改share结构
const isWap = ref(false)

const handleResize = () => {
  isWap.value = window.innerWidth <= 548
  carouselWidth.value = carouselsWrapRef.value?.clientWidth
}

onMounted(() => {
  isWap.value = window.innerWidth <= 548
  carouselWidth.value = carouselsWrapRef.value?.clientWidth
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handlePrev = () => {
  if (index.value === 0) {
    return
  }

  index.value--
  carouselRef.value.prev()
}

const handleNext = () => {
  if (index.value === questStore.twitterPosts?.length - Math.floor(slidesCount.value)) {
    return
  }
  index.value++
  carouselRef.value.next()
}

const handleClick = (item: SharingTask) => {
  item.redirectUrl && window.open(item.redirectUrl, '_blank')
}
</script>

<template>
  <div class="posts-card">
    <div class="header">
      <div class="title">
        Engage with our Twitter Posts

        <boom-tip title="About Engage with our Twitter Posts">
          <p>
            Stay connected and engaged with our most significant events on Twitter. We share daily
            highlights and major partnership announcements there.
          </p>
          <p>
            Don't miss out on the latest from us—keep an eye on our Twitter for all the exciting
            updates!
          </p>
        </boom-tip>
      </div>
      <div class="actions" v-if="!isWap">
        <SvgIcon :class="{ disabled: index === 0 }" name="quest-left" @click="handlePrev"></SvgIcon>
        <SvgIcon
          :class="{ disabled: index === questStore.twitterPosts?.length - Math.floor(slidesCount) }"
          name="quest-right"
          @click="handleNext"
        ></SvgIcon>
      </div>
    </div>
    <div ref="carouselsWrapRef" class="carousels-wrap" v-if="!isWap">
      <a-carousel
        v-if="slidesCount"
        ref="carouselRef"
        :initial-slide="0"
        :slides-to-show="slidesCount"
        :slides-to-scroll="1"
        :dots="false"
        :infinite="false"
      >
        <div
          class="card"
          v-for="item in questStore.twitterPosts"
          :key="item.id"
          @click="handleClick(item)"
        >
          <div class="wrap">
            <div class="title">
              <SvgIcon name="quest-logo"></SvgIcon>
              <span class="title__text">GamerBoom</span>
            </div>
            <div class="card__content" v-html="item.displayText"></div>
          </div>
        </div>
      </a-carousel>
    </div>
    <div class="posts-list" v-else>
      <div
        class="card"
        v-for="item in questStore.twitterPosts"
        :key="item.id"
        @click="handleClick(item)"
      >
        <div class="wrap">
          <div class="title">
            <SvgIcon name="quest-logo"></SvgIcon>
            <span class="title__text">GamerBoom</span>
          </div>
          <div class="card__content" v-html="item.displayText"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.posts-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;

    .title {
      color: var(--100, #fff);
      font-family: Quicksand;
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
    }

    .actions {
      .svg-icon {
        font-size: 24px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.5;
        }

        &.disabled {
          opacity: 0.3;
        }

        & + .svg-icon {
          margin-left: 12px;
        }
      }
    }
  }

  .carousels-wrap {
    width: 100%;
    min-height: 175px;
  }

  .card {
    display: flex;
    padding-right: 16px;
    align-self: stretch;
    cursor: pointer;

    .wrap {
      display: flex;
      flex-direction: column;
      padding: 16px;
      align-items: flex-start;
      gap: 12px;
      height: 175px;
      width: 100%;

      border-radius: 24px;
      border: 1px solid var(--4, rgba(255, 255, 255, 0.04));
      background: var(--2, rgba(255, 255, 255, 0.02));

      .title {
        display: flex;
        align-items: center;

        .svg-icon {
          margin-right: 8px;
          font-size: 40px;
          color: #2c2e46;
        }

        &__text {
          color: var(--100, #fff);
          font-family: Quicksand;
          font-size: 20px;
          font-style: normal;
          font-weight: 700;
          line-height: 24px; /* 120% */
        }
      }
    }

    &__content {
      color: rgba(255, 255, 255, 0.6);
      font-family: Quicksand;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 160%; /* 22.4px */
    }
  }

  .posts-list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    align-self: stretch;

    .card {
      padding-right: 0;

      .wrap {
        height: auto;
      }
    }
  }
}
</style>
