<template>
  <div class="zone" :class="zoneClass" :style="styleObject"></div>
  <div v-if="variant === 'island'" class="zone zone--market" :style="marketStyle">
  </div>
</template>

<script>
import { MARKET_RANGE_COEFF } from '@/fishZones'

export default {
  name: 'Zone',
  props: {
    zone: {
      type: Object,
      required: true
    },
    boat: {
      type: Object,
      required: true
    },
    variant: { // fishing / island
      type: String,
      default: 'fishing'
    }
  },
  computed: {
    styleObject() {
      const offsetX = this.zone.x - this.boat.x
      const offsetY = this.zone.y - this.boat.y
      return {
        left: `calc(50% + ${offsetX}px)`,
        top: `calc(50% + ${offsetY}px)`,
        width: `${this.zone.radius * 2}px`,
        height: `${this.zone.radius * 2}px`
      }
    },
    marketStyle() {
      if (this.variant !== 'island') return {}
      const marketRadius = this.zone.radius * MARKET_RANGE_COEFF
      const offsetX = this.zone.x - this.boat.x
      const offsetY = this.zone.y - this.boat.y
      return {
        left: `calc(50% + ${offsetX}px)`,
        top: `calc(50% + ${offsetY}px)`,
        width: `${marketRadius * 2}px`,
        height: `${marketRadius * 2}px`
      }
    },
    zoneClass() {
      if (this.variant === 'fishing') {
        return `zone--${this.zone.type || 'low'}`
      } else if (this.variant === 'island') {
        return 'zone--island'
      }
      return ''
    }
  }
}
</script>

<style scoped lang="scss">
.zone {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;

  &--low {
    background: rgba(0, 255, 0, 0.2);
  }

  &--medium {
    background: yellow;
    opacity: 0.3;
  }

  &--high {
    background: red;
    opacity: 0.3;
  }

  &--island {
    background: green;
    opacity: 0.5;
  }

  &--market {
    background: rgba(0, 200, 255, 0.2);
    border: 3px dashed #00c8ff;
    pointer-events: none;
  }
}
</style>