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
  padding: 4px;
  align-items: flex-end;
  gap: 4px;
  border-radius: 48px;
  background: #0f1017;
  width: 198px;
  height: 46px;

  .button-item {
    display: flex;
    width: 50%;
    height: 100%;
    justify-content: center;
    align-items: center;
    border-radius: 48px;
    opacity: 0.2;
    cursor: pointer;

    color: #fff;
    font-size: 14px;
    font-weight: 700;
    line-height: 120%; /* 16.8px */
    text-transform: capitalize;

    &-selected {
      background: #272b40;
      opacity: 1;
    }
  }
}
</style>
