<template>
  <div
    class="c-bubble"
    :class="'c-bubble--' + type + ' c-bubble--' + sizeType"
    :data-id="bubbleId"
    :style="{ left: left + 'px', top: top + 'px', width: size + 'px', height: size + 'px', backgroundColor: bubbleColor }"
  >
    <span class="c-bubble--blik"></span>
  </div>
</template>

<script>
import { BUBBLE_DEFAULTS, GAME_COLOR_HEX } from '@/constants/gameConfig.js'

export default {
  name: 'Bubble',

  props: {
    bubbleId: {
      type: Number,
      default: BUBBLE_DEFAULTS.bubbleId
    },
    type: {
      type: String,
      default: BUBBLE_DEFAULTS.type
    },
    left: {
      type: Number,
      default: BUBBLE_DEFAULTS.left
    },
    top: {
      type: Number,
      default: BUBBLE_DEFAULTS.top
    },
    size: {
      type: Number,
      default: BUBBLE_DEFAULTS.size
    },
    sizeType: {
      type: String,
      default: BUBBLE_DEFAULTS.sizeType
    }
  },

  computed: {
    bubbleColor() {
      return GAME_COLOR_HEX[this.type] || GAME_COLOR_HEX.red
    }
  }
}
</script>

<style lang="scss" scoped>
.c-bubble {
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.45);
  opacity: 0.86;

  // Добавить ли тень блику??!!

  &--blik {
    position: absolute;
    top: 15%;
    left: 20%;
    width: 35%;
    height: 25%;
    display: block;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.35);
    pointer-events: none;
  }

  &--big {
    border-width: 2px;
  }

  &--medium {
    border-width: 1px;
  }

  &--small {
    border-width: 1px;
    opacity: 0.9;
  }
}
</style>
