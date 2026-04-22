<template>
  <div class="enemy" :style="styles">

  </div>
</template>

<script lang="ts">
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
    color: {
      type: String,
      default: 'rgb(171, 17, 17)'
    },
  },
  computed: {
    styles () {
      return {
        left: `${this.x}%`,
        top: `${this.y}%`,
        backgroundColor: this.color
      }
    }
  },
}

</script>

<style scoped lang="scss">
.enemy {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>