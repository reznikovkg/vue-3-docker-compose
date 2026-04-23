<template>
  <div 
    class = "bomb"
    :class = "bombClass"
    :style = "bombStyle"
  >
  </div>
</template>

<script>
export default {
  name: 'Bomb',
  props: {
    row: Number,
    col: Number,
    cellSize: Number,
    type: {
      type: String,
      default: 'black'
    }
  },
  computed: {
    bombStyle() {
      const gap = 2
      const padding = 2
      const offset = this.cellSize + gap

      return {
        left: this.col * offset + padding + 'px',
        top: this.row * offset + padding + 'px'
      }
    },
    bombClass() {
      return `bomb--${this.type}`
    }
  }
}
</script>

<style scoped lang = "scss">
.bomb {
  position: absolute;
  width: v-bind('cellSize + "px"');
  height: v-bind('cellSize + "px"');
  border-radius: 4px;
  
  &--black {
    background: #333;
  }
  &--red {
    background: #ff4444;
  }
  &--green {
    background: #44ff44;
  }
}
</style>