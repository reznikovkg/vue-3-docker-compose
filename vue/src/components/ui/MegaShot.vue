<template>
  <div class="megashot" :style="styles" />
</template>

<script>
export default {
  name: 'MegaShot',
  props: {
    startX: {
      type: Number,
      default: 0
    },
    startY: {
      type: Number,
      default: 0
    },
    endX: {
      type: Number,
      default: 0
    },
    endY: {
      type: Number,
      default: 0
    }
  },
  computed: {
    styles () {
      const dx = this.endX - this.startX
      const dy = this.endY - this.startY
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * 180 / Math.PI
      return {
        top: `${this.startY}px`,
        left: `${this.startX}px`,
        width: `${length}px`,
        transform: `rotate(${angle}deg)`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.megashot {
  position: absolute;
  border-radius: 50%;
  height: 28px;
  background: blueviolet;
  transform-origin: left center;
}
</style>
