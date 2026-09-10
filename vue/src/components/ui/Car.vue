<template>
  <div class="car" :class="{ 'car--hit': hit }" :style="styles" />
</template>

<script lang="ts">
export default {
  name: 'Car',
  props: {
    image: {
      type: String,
      required: true,
    },
    lane: {
      type: Number,
      default: 1
    },
    direction: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    hit: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    styles () {
      return {
        backgroundImage: `url("${this.image}")`,
        top: this.y + '%',
        left: `${((this.lane - 0.5) * 25) - 7.5}%`,
        transform: `rotate(${this.direction * 180}deg)`,
      }
    }
  }
}
</script>

<style scoped lang="scss">
.car {
  width: 15%;
  position: absolute;
  top: 0;
  aspect-ratio: 100 / 150;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  transition: left 0.45s ease, top 0.05s linear, opacity 0.3s ease;

  &--hit {
    opacity: 0.35;
  }
}
</style>
