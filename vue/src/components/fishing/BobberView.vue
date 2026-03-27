<template>
  <div
    class="bobber-view"
    :class="{
      'bobber-view--energized': isEnergized,
      'bobber-view--waiting': mode === 'waiting',
      'bobber-view--hooked': mode === 'hooked'
    }"
    :style="{
      left: `${currentPosition.x}%`,
      top: `${currentPosition.y}%`
    }"
  ></div>
</template>

<script>
import { defineConfig } from '@/utils/defineConfig'

const DEFAULT_POSITION = defineConfig({
  x: 40,
  y: 56
})

export default {
  name: 'BobberView',
  props: {
    anchorPosition: {
      type: Object,
      default: () => ({
        ...DEFAULT_POSITION
      })
    },
    mode: {
      type: String,
      default: 'waiting'
    },
    isEnergized: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    },
    targetPosition: {
      type: Object,
      default: () => ({
        ...DEFAULT_POSITION
      })
    }
  },
  computed: {
    currentPosition() {
      if (this.mode !== 'hooked') {
        return this.anchorPosition
      }

      const safeProgress = Math.min(Math.max(this.progress, 0), 1)

      return {
        x:
          this.anchorPosition.x +
          (this.targetPosition.x - this.anchorPosition.x) * safeProgress,
        y:
          this.anchorPosition.y +
          (this.targetPosition.y - this.anchorPosition.y) * safeProgress
      }
    }
  }
}
</script>

<style scoped lang="scss">
.bobber-view {
  background: radial-gradient(circle at 30% 30%, #fff 1px, #d32f2f 60%);
  border: 1px solid #7f1212;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 117, 117, 0.45);
  height: 12px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 12px;
  z-index: 3;
}
</style>
