<template>
  <div class = "enemy" :style = "styles">
  </div>
</template>

<script lang = "ts">
export default {
  name: 'enemy',
  props: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
  },
  computed: {
    styles () {
      return {
        left: `${this.x}%`,
        top: `${this.y}%`
      }
    }
  },
}
</script>

<style scoped lang = "scss">
.enemy {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 50px;
  background-color: rgb(194, 206, 24);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
</style>