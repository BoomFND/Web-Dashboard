<script lang="ts" setup>
interface Options {
  label: string
  value: any
}
interface Props {
  modelValue: any
  options: Array<Options>
}

const props = defineProps<Props>()

const active = ref(props.modelValue)

const emit = defineEmits(['update:modelValue', 'change'])

const handleCheck = (value: any) => {
  active.value = value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div class="button-group">
    <div
      v-for="item in props.options"
      :key="item.value"
      class="button-item"
      :class="active === item.value ? 'button-item-selected' : ''"
      @click="handleCheck(item.value)"
    >
      <slot :name="item.value">
        {{ item.label }}
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.button-group {
  display: flex;
  width: clamp(300px, 100%, 362px);
  height: 44px;
  padding: 2px 4px;
  border-radius: 80px;
  background: #fff;
  gap: 4px;

  .button-item {
    display: flex;
    width: 50%;
    height: 100%;
    justify-content: center;
    align-items: center;
    border-radius: 40px;
    cursor: pointer;

    color: rgba(29, 29, 31, 0.89);
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    line-height: 142.857%;

    &-selected {
      color: #fff;
      background: #1d1d1f;
    }
  }
}
</style>
