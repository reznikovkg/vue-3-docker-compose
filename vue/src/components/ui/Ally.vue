<template>
  <div class="ally" :style="styles">
    <div class="ally__hp" :style="hpStyles"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Ally',
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
    },
    hpStyles () {
      return {

      }
    }
  },
}

</script>

<style scoped lang="scss">
.ally {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 35px;
  height: 35px;
  border-radius: 50%;
}
</style>