<script lang="ts" setup>
import { getUserAvatarColor } from '@/utils/index'
import { computed, defineComponent, ref, watch } from 'vue'
const props = defineProps({
  username: String,
  src: String,
  rounded: {
    type: Boolean,
    default: true,
  },
  size: {
    type: Number,
    default: 38,
  },
  color: String,
  backgroundColor: {
    type: String,
    default: '#4D97FF',
  },
  customStyle: {
    type: Object,
  },
  inline: Boolean,
})

const lastname = ref('')
const imgError = ref(false)

const isImage = computed(() => {
  return !imgError.value && !!props.src
})

const currentColor = computed(() => {
  return props.color || getUserAvatarColor(props.username || '')
})

const style: Record<string, any> = computed(() => {
  const style = {
    display: props.inline ? 'inline-flex' : 'flex',
    width: `${props.size}px`,
    height: `${props.size}px`,
    borderRadius: props.rounded ? '50%' : '10px',
    lineHeight: `${props.size + Math.floor(props.size / 20)}px`,
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    overflow: 'hidden',
  }

  const imgBackgroundAndFontStyle = {
    background: `transparent url('${props.src}') no-repeat scroll 0% 0% / ${props.size}px ${props.size}px content-box border-box`,
  }

  if (isImage.value) Object.assign(style, imgBackgroundAndFontStyle)
  return style
})

// 判断是否姓名为英文，如果是英文，则截取2字母；然后再判断是否为复姓，复姓则取前两字，非复姓，则取第一个字
const getLastName = (fullName: string): string => {
  if (!fullName) return ''

  if (fullName.search(/[A-Za-z]/) !== -1) {
    const arr = fullName.split(' ')
    return arr[0].charAt(0).toUpperCase()
  }

  return fullName.substring(0, 1)
}

const onImgError = () => {
  imgError.value = true
}

const emit = defineEmits(['clear'])

watch(
  () => props.username,
  (val) => {
    if (!val) return
    lastname.value = getLastName(val)
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="avatar">
    <div class="avatar--wrapper" :style="[style, props.customStyle]">
      <img v-if="isImage" :src="props.src" @error="onImgError" />
      <div v-else :style="{ color: currentColor }">
        <SvgIcon name="common-avatar" :style="{ width: props.size, height: props.size }" />
        <div class="name" :style="`transform: scale(${(props.size || 38) / 38})`">
          {{ lastname }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &--wrapper {
    position: relative;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .name {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
  }
}
</style>