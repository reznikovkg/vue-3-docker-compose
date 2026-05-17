<template>
  <div class="areashot" :style="styles" />
</template>

<script>
export default {
  name: 'AreaShot',
  props: {
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
      const radius = 200
      return {
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        top: `${this.y - radius}px`,
        left: `${this.x - radius}px`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.areashot {
  position: absolute;
  border-radius: 50%;
  border: 6px solid rgb(43, 226, 217);
  box-sizing: border-box;
}
</style>
