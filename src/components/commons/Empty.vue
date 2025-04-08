<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  description?: string
}>()
</script>

<template>
  <div class="empty">
    <SvgIcon name="common-empty" />
    <div class="text">
      <slot name="description">
        {{ description ?? 'No Data' }}
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empty {
  display: flex;
  width: 214px;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--color-primary);

  .svg-icon {
    width: 64px;
    height: 64px;
    opacity: 0.3;
  }

  .text {
    color: rgba(29, 29, 31, 0.3);
    text-align: center;
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px; /* 128.571% */
  }
}
</style>
