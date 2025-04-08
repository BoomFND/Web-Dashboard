<script lang="ts" setup>
import type { SelectProps, SelectRenderLabel, SelectRenderTag } from 'naive-ui'
import { usePointsStore } from '@/stores/points'

const pointsStore = usePointsStore()
const selectedSeasonId = ref<string | number | null>(null)

watch(
  () => pointsStore.currentSeason,
  (newVal) => {
    selectedSeasonId.value = newVal.id
  },
  { deep: true }
)

const renderLabel: SelectRenderLabel = (option) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    },
    [
      h(
        'div',
        {
          style: {
            padding: '4px 0',
            fontSize: '16px'
          }
        },
        [option.name as string]
      ),
      option.live
        ? h(
            'div',
            {
              style: {
                borderRadius: '4px',
                color: '#fff',
                background: '#0AC2C2',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '600',
                lineHeight: '16px'
              }
            },
            'Live'
          )
        : null,
      option.highlight
        ? h(
            'div',
            {
              style: {
                borderRadius: '4px',
                color: '#fff',
                background: '#F73558',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '600',
                lineHeight: '16px'
              }
            },
            'Hot'
          )
        : null
    ]
  )
}

const renderOptionTag: SelectRenderTag = ({ option }) => {
  return h(
    'div',
    {
      class: 'select-label-tag',
      style: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '8px'
      }
    },
    [
      h(
        'div',
        {
          style: {
            color: 'rgba(29, 29, 31, 0.85)',
            fontSize: '16px',
            fontWeight: '600',
            lineHeight: '125%'
          }
        },
        [option.name as string]
      ),
      option.live
        ? h(
            'div',
            {
              style: {
                borderRadius: '4px',
                color: '#fff',
                background: '#0AC2C2',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '600',
                lineHeight: '16px'
              }
            },
            'Live'
          )
        : null,
      option.highlight
        ? h(
            'div',
            {
              style: {
                borderRadius: '4px',
                color: '#fff',
                background: '#F73558',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '600',
                lineHeight: '16px'
              }
            },
            'Hot'
          )
        : null
    ]
  )
}

type SelectThemeOverrides = NonNullable<SelectProps['themeOverrides']>
const selectThemeOverrides: SelectThemeOverrides = {
  peers: {
    InternalSelection: {
      textColor: 'rgba(29, 29, 31, 0.85)',
      borderRadius: '40px',
      color: 'transparent',
      colorActive: 'transparent',
      border: '1.5px solid rgba(110, 110, 115, 0.40)',
      borderActive: '1.5px solid #1D1D1F',
      borderFocus: '1.5px solid #6E6E73',
      borderHover: '1.5px solid rgba(110, 110, 115, 0.30)',
      placeholderColor: '#6E6E73',
      heightMedium: '44px',
      paddingSingle: '0 36px 0 16px',
      boxShadowFocus: 'none',
      boxShadowActive: 'none',
      arrowColor: '#1D1D1F'
    },
    InternalSelectMenu: {
      optionCheckColor: 'rgba(29, 29, 31, 0.89)',
      optionColorActive: 'rgba(29, 29, 31, 0.03)',
      optionColorPending: 'rgba(29, 29, 31, 0.03)',
      optionPaddingMedium: '6px 16px',
      groupHeaderTextColor: 'rgba(110, 110, 115, 0.60)',
      optionTextColorActive: '#1D1D1F',
      optionTextColorPressed: '#1D1D1F',
      borderRadius: '8px'
    }
  }
}

const handleChange = (value: string | number | null) => {
  const selectedSeason = pointsStore.seasons?.find((item) => item.id === value)

  if (selectedSeason && selectedSeason.id) {
    pointsStore.setCurrentSeason(selectedSeason)
  }
}
</script>

<template>
  <n-select
    v-model:value="selectedSeasonId"
    label-field="name"
    value-field="id"
    placeholder="Please Select Season"
    :options="pointsStore.seasons"
    :render-label="renderLabel"
    :render-tag="renderOptionTag"
    :theme-overrides="selectThemeOverrides"
    @update:value="handleChange"
  />
</template>

<style lang="scss" scoped></style>
<style lang="scss">
.n-base-select-menu .n-base-select-option::before {
  left: 0;
  right: 0;
}

.v-vl-items {
  padding: 0 !important;
}

.n-select-menu {
  --n-option-padding-left: 10.67px !important;
  --n-option-padding-right: 10.67px !important;
}

.n-base-select-group-header .select-label div:first-child {
  color: rgba(110, 110, 115, 0.6) !important;
}

.n-base-suffix {
  right: 16px !important;
}
</style>
