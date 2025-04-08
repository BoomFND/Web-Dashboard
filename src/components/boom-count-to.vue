<script lang="ts" setup>
import gsap from 'gsap'
import { useNumberFormat } from '@/hooks/useNumberFormat'

const { formatNumber } = useNumberFormat()

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
})

const animationNum = reactive({ num: 0 })

/**
 * 当父组件传入的数字发生变化时，会使用gsap库实现数字平滑过渡动画
 */
const animationToValue = () => {
  gsap.to(animationNum, {
    duration: 2,
    num: props.modelValue
  })
}

watch(
  () => props.modelValue,
  () => animationToValue(),
  {
    immediate: true
  }
)
</script>

<template>
  {{ formatNumber(animationNum.num.toFixed(0)) }}
</template>

<style lang="scss" scoped></style>
