<script lang="ts" setup>
interface Props {
  avatar: any
}
interface Emits {
  (event: 'update:avatar', file: any): void
  (event: 'change', file: any): void
}

defineProps<Props>()

const emits = defineEmits<Emits>()

/** 处理文件上传 */
const handleFileUpload = (event: any) => {
  // 获取到上传的文件
  const file = event.target.files[0]
  const URL = window.URL || window.webkitURL
  // 同步更新图像链接
  emits('update:avatar', URL.createObjectURL(file))
  // 发送change事件，将上传的文件抛出去
  emits('change', file)
}
</script>

<template>
  <div class="upload-wrapper">
    <label for="file-upload" class="custom-upload-label">
      <span v-if="!avatar">+</span>
      <img v-else :src="avatar" class="avatar" />
    </label>
    <input
      name="file"
      type="file"
      id="file-upload"
      accept="image/jpg,image/png,image/jpeg"
      @change="handleFileUpload"
      class="custom-upload-input"
    />
  </div>
</template>

<style lang="scss" scoped>
.custom-upload-input {
  display: none !important;
}

.upload-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  .custom-upload-label {
    width: 70px;
    height: 70px;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1f2231;
    color: #b1b7c5;
    text-align: center;
    font-family: Quicksand;
    font-size: 64px;
    font-style: normal;
    font-weight: 300;
    line-height: 120%;
    text-transform: capitalize;
    border: 1px solid #1f2231;
    box-sizing: border-box;
    overflow: hidden;

    &:hover {
      color: #f4dca5;
      border-color: #f4dca5;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
}
</style>
