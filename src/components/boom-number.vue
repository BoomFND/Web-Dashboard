<script lang="ts" setup>
interface Props {
  symbol?: string
  unit?: string
  number: number | null | undefined
}

const props = defineProps<Props>()

const isNumber = computed(() => typeof props.number === 'number')
</script>

<template>
  <div class="boom-number">
    <template v-if="isNumber">
      <div v-if="props.number" class="symbol">{{ props.symbol }}</div>
      <div class="number">{{ props.number }}</div>
      <div class="unit">{{ props.unit }}</div>
    </template>
    <div v-else class="number">--</div>
  </div>
</template>

<style lang="scss" scoped>
.boom-number {
  display: inline-flex;
  font-weight: 600;
  line-height: 120%; /* 28.8px */

  .symbol {
    font-size: 14px;
    font-weight: 600;
  }

  .number,
  .unit {
    margin-left: 8px;
    font-size: 24px;
    font-weight: 600;
  }
}
</style>
