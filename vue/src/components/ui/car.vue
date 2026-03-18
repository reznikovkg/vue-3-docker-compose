<template>
  <div class="car" :style="styles" />
</template>

<script lang="ts">


export default {
  name: 'car',
  props: {
    image: {
      type: String,
    },
    lane: {
      type: Number,
      default: 0
    },
    direction: {
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
        backgroundImage: `url(${this.image})`,
        top: this.y + '%',
        left: `${((this.lane - 1) * 25.5) + 4}%`,
        transform: `rotate(${this.direction * 180}deg)`,
      }
    }
  }
}
</script>

<style scoped lang="scss">
.car {
  width: 15.5%;
  height: 33%;
  position: absolute;
  top: 0;
  background-size: 100% 100%;
  transition: 0.5s;
}
</style>