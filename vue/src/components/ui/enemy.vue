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

<style scoped lang="scss">
.enemy {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background-color: rgb(171, 17, 17);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>