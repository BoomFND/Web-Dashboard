<script lang="ts" setup>
defineProps({
  width: {
    type: Number,
    default: 581
  },
  height: {
    type: Number,
    default: 317
  }
})
</script>

<template>
  <div
    class="coming-soon"
    :style="{ width: `${(width * 100) / 1920}vw`, height: `${(height * 100) / 1920}vw` }"
  >
    Coming Soon
  </div>
</template>

<style lang="scss" scoped>
.coming-soon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 581px;
  height: 317px;
  flex-shrink: 0;
  border-radius: 32px;
  background-image: url('@/assets/images/dashboard/coming-soon-bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-color: #090c0f;
  color: rgba(#fff, 0.2);
  font-family: Urbanist;
  font-size: 32px;
  font-style: normal;
  font-weight: 800;
  line-height: 30px; /* 93.75% */
}
</style>
