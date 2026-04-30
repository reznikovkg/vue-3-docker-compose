<template>
  <div class="enemy" :style="styles">
    Enemy
  </div>
</template>

<script>
export default {
  name: 'Enemy',
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
.enemy {
  position: absolute;
  border-radius: 50%;
  background: rgb(28, 39, 128);
  width: 52px;
  height: 52px;
  transition: 0.1s;
  text-align: center;
}
</style>
