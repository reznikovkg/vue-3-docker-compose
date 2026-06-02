<template>
  <div
    class = "projectile"
    :class = "projectileClasses"
    :style = "styles"
  >
  </div>
</template>

<script>
export default {
  name: 'Projectile',

  props: {
    x: {
      type: Number,
      default: 0
    },

    y: {
      type: Number,
      default: 0
    },

    size: {
      type: Number,
      default: 10
    },

    isEnemy: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    styles() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        transform: `translateX(${this.x}px) translateY(${this.y}px) translate(-50%, -50%)`
      }
    },

    projectileClasses() {
      return {
        'projectile--enemy': this.isEnemy
      }
    }
  }
}
</script>

<style scoped lang="scss">
.projectile {
  position: absolute;

  border-radius: 50%;
  background: #ff3333;

  &--enemy {
    background: #ffcc00;
  }
}
</style>