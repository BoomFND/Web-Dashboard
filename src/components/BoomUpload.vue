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
      <SvgIcon v-if="!avatar" name="common-upload" />
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
  width: 80px;
  height: 80px;
  border-radius: 100%;

  .custom-upload-label {
    width: 100%;
    height: 100%;
    border-radius: 100%;
    box-sizing: border-box;
    overflow: hidden;
    cursor: pointer;

    .svg-icon {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      flex-shrink: 0;
    }
  }
}
</style>
