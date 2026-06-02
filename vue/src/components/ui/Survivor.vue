<template>
  <div
    class = "survivor"
    :style = "styles"
  >
  </div>
</template>

<script>
export default {
  name: 'Survivor',

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
    styles() {
      return {
        transform: `translateX(${this.x}px) translateY(${this.y}px) translate(-50%, -50%)`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.survivor {
  position: absolute;

  width: 30px;
  height: 30px;

  background: #33cc66;
}
</style>