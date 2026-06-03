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
    projectile: {
      type: Object,
      default() {
          return {}
      }
    }
  },

  computed: {
    styles() {
      return {
        width: `${this.projectile.size}px`,
        height: `${this.projectile.size}px`,
        transform: `translateX(${this.projectile.screenX}px) translateY(${this.projectile.screenY}px) translate(-50%, -50%)`
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