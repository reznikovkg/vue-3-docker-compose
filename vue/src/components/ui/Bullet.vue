<template>
  <div class="bullet" :style="styles" />
</template>

<script>
export default {
  name: 'Bullet',
  props: {
    id: {
      type: Number,
      default: 0
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  computed: {
    styles () {
      return {
        transform: `translate(-50%, -50%) translateX(${this.x}px) translateY(${this.y}px)`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.bullet {
  position: absolute;
  border-radius: 50%;
  background: black;
  width: 28px;
  height: 28px;
  transition: 0.1s;
}
</style>
