<template>
  <div
    class="shot"
    :style="{
      left: x1 + 'px',
      top: y1 + 'px',
      width: length + 'px',
      transform: `rotate(${angle}rad)`
    }"
  ></div>
</template>

<script>
export default {
  name: 'Shot',
  props: {
    x1: Number,
    y1: Number,
    length: Number,
    angle: Number
  }
}
</script>

<style scoped lang="scss">
.shot {
  position: absolute;
  height: 2px;
  background: #ffeb3b;
  transform-origin: 0 50%;
  pointer-events: none;
  z-index: 6;
  box-shadow: 0 0 6px rgba(255, 235, 59, 0.8);
}
</style>