<script lang="ts" setup>
import { computed } from 'vue'
interface Props {
  prefix?: string
  name: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  prefix: 'icon',
  color: '#1D1D1F',
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<style lang="scss" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  color: currentColor;
}
</style>
