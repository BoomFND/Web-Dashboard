<script lang="ts" setup>
interface Props {
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom'
  title?: string
  content?: string
}

const props = defineProps<Props>()
</script>

<template>
  <a-tooltip color="#FFF" :placement="placement ?? 'top'">
    <template #title>
      <slot>{{ props.content }}</slot>
    </template>
    <svg-icon name="common-tip"></svg-icon>
  </a-tooltip>
</template>

<style lang="scss" scoped>
.svg-icon {
  margin-left: 6px;
  width: 18px;
  height: 18px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
}

:global(.ant-tooltip) {
  width: 300px;
}
:global(.ant-tooltip .ant-tooltip-inner) {
  padding: 8px 12px;
  color: #6e6e73;
}
</style>
