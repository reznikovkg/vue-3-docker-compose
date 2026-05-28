<template>
  <button class="btn" :style="styles">
    <span class="btn__plus">
      +
    </span>
  </button>
</template>

<script lang="ts">
export default {
  name: 'addTowerBtn',
  props: {
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    }
  },
  computed: {
    styles () {
      return{
        left: `${this.x}%`,
        top: `${this.y}%`
      }
    }
  },
}
</script>

<style lang="scss">
.btn {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: transparent;
  border: none;
  cursor: pointer;

  &__plus {
    color: rgb(67, 159, 39);
    font-size: 100px;
    text-align: center;
    line-height: 100px;
  }
}
</style>