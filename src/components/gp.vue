<script lang="ts" setup>
import SvgIcon from './commons/SvgIcon.vue'
interface Props {
  value?: string | number
  rawValue?: string | number
  label?: string
  gameName: string
  custostyle?: Record<string, string>
  valueStyle?: Record<string, string>
  circleClass?: string
  gpStyle?: Record<string, string>
}

defineProps<Props>()
</script>

<template>
  <div class="gp-circle" :style="gpStyle">
    <svgIcon class="gp-circle__center" :name="gameName" :style="custostyle" />
    <div class="gp-circle__text" :class="circleClass">
      <slot>
        <div
          class="value tooltip-container"
          v-if="value !== undefined && value !== null"
          :style="valueStyle"
        >
          {{ value }}
          <div class="custom-tooltip" v-if="rawValue !== undefined && rawValue !== null">
            {{ rawValue }}
          </div>
        </div>
        <div class="label" v-if="label">{{ label }}</div>
        <slot name="operation"></slot>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gp-circle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 280px;
  height: 280px;
  font-family: Urbanist;
  text-transform: uppercase;
  border: 0.873px solid var(---1400, #e0e0e0);
  border-radius: 50%;
  filter: drop-shadow(0px 0px 6.17077779769897px rgba(0, 0, 0, 0.1));

  .hcircle {
    position: absolute;
    width: 110px;
    height: 75px;
    color: '#121214' !important;
    top: 46px;
  }

  &__bg,
  &__center {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__text {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .core {
      width: 36px;
      height: 36px;
    }

    .value {
      color: #fff;
      font-size: 40px;
      font-weight: 700;
      line-height: 120%; /* 48px */
      text-transform: capitalize;
    }

    .label {
      color: rgba(255, 255, 255, 0.4);
      font-size: 16px;
      font-weight: 700;
      line-height: 120%; /* 19.2px */
      text-transform: uppercase;
    }
  }
}

.tooltip-container {
  position: relative;
  cursor: pointer;

  &:hover .custom-tooltip {
    visibility: visible;
    opacity: 1;
  }

  .custom-tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    z-index: 9999;
    width: auto;
    min-width: 180px;
    max-width: 300px;
    padding: 12px 16px;
    background: #f5f5f5;
    color: #121214;
    font-size: 24px;
    font-weight: 700;
    line-height: 120%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    transition:
      opacity 0.3s,
      visibility 0.3s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 8px 8px 0;
      border-style: solid;
      border-color: #f5f5f5 transparent transparent;
    }
  }
}
</style>
