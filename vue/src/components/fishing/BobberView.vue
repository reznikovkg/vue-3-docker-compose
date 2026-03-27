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
$bobber-size: 14px;
$bobber-border: #7f1212;
$bobber-highlight: rgba(255, 255, 255, 0.28);
$bobber-glow: rgba(255, 117, 117, 0.45);
$bobber-shadow: rgba(0, 0, 0, 0.24);
$bobber-shadow-strong: rgba(0, 0, 0, 0.28);
$bobber-shadow-hooked: rgba(0, 0, 0, 0.22);

.bobber-view {
  background: radial-gradient(circle at 30% 30%, #ffffff 1px, #d32f2f 60%);
  border: 1px solid $bobber-border;
  border-radius: 50%;
  box-shadow:
    0 0 0 1px $bobber-highlight,
    0 0 18px $bobber-glow,
    0 2px 8px $bobber-shadow;
  height: $bobber-size;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, -50%);
  transition:
    transform 0.24s ease,
    filter 0.24s ease,
    box-shadow 0.24s ease;
  width: $bobber-size;
  z-index: 3;

  &--waiting {
    filter: saturate(1.1);
  }

  &--energized {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.42),
      0 0 24px rgba(255, 117, 117, 0.72),
      0 4px 14px $bobber-shadow-strong;
    filter: brightness(1.08) saturate(1.24);
  }

  &--hooked {
    animation: none;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.18),
      0 0 10px rgba(255, 117, 117, 0.24),
      0 2px 8px $bobber-shadow-hooked;
    filter: brightness(0.95) saturate(0.9);
    transform: translate(-50%, -50%) scale(0.94);
  }

  &--hooked#{&}--energized {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.42),
      0 0 24px rgba(255, 117, 117, 0.72),
      0 4px 14px $bobber-shadow-strong;
    filter: brightness(1.08) saturate(1.24);
  }
}
</style>
