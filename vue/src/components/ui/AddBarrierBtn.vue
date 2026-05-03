<template>
  <button class="btn" :style="styles">
    <span class="btn__plus">+</span>
  </button>
</template>

<script lang="ts">
export default {
  name: 'AddBarrierBtn',
  props: {
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    angle: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    styles () {
      return{
        left: `${this.x}%`,
        top: `${this.y}%`,
        transform: `translate(-50%, -50%) rotate(${this.angle}deg)`
      }
    }
  },
}
</script>

<style scoped lang="scss">
.btn {
  position: absolute;
  width: 30px;
  height: 70px;
  background-color: rgb(225, 210, 159);
  border-radius: 20%;
  border: 3px solid rgb(103, 83, 16);
  cursor: pointer;

  &__plus {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: rgb(43, 118, 20);
    font-size: 25px;
    line-height: 25px;
  }
}
</style>