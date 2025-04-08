<script lang="ts" setup>
interface Props {
  title: string
  content?: string
}

const props = defineProps<Props>()

const showModal = ref(false)
const handleClick = () => {
  showModal.value = true
}
</script>

<template>
  <svg-icon name="tip" @click="handleClick"></svg-icon>

  <a-modal
    wrapClassName="modal-small"
    ref="modalRef"
    v-model:open="showModal"
    :footer="null"
    width="408px"
  >
    <template #title>
      <div>{{ props.title }}</div>
    </template>

    <slot>{{ props.content }}</slot>
  </a-modal>
</template>

<style lang="scss" scoped>
.svg-icon {
  margin-left: 6px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}
</style>
