<template>
  <div
    class="artillery-strike"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
  >
    <div class="artillery-strike__effect" :style="effectStyle"></div>
  </div>
</template>

<script>
export default {
  name: 'ArtilleryStrike',
  props: {
    x: Number,
    y: Number,
    maxRadius: { type: Number, default: 80 },
    elapsed: { type: Number, default: 0 },
    duration: { type: Number, default: 800 }
  },
  computed: {
    progress() {
      return Math.min(1, this.elapsed / this.duration)
    },
    currentRadius() {
      return this.maxRadius * this.progress
    },
    effectStyle() {
      const opacity = 1 - this.progress
      const size = this.currentRadius * 2.2
      
      return {
        width: size + 'px',
        height: size + 'px',
        marginLeft: -this.currentRadius * 1.1 + 'px',
        marginTop: -this.currentRadius * 1.1 + 'px',
        opacity: opacity,
        background: `radial-gradient(circle, 
          rgba(255, 100, 0, ${opacity}) 0%, 
          rgba(255, 150, 0, ${opacity * 0.7}) 40%, 
          rgba(255, 200, 0, ${opacity * 0.3}) 70%, 
          transparent 100%)`,
        border: `2px solid rgba(255, 150, 0, ${opacity * 0.5})`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.artillery-strike {
  position: absolute;
  z-index: 10;
  pointer-events: none;

  &__effect {
    position: absolute;
    border-radius: 50%;
  }
}
</style>