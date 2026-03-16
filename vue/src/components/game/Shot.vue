<template>
  <div
    class="shot"
    :class="`shot--${variant}`"
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
    angle: Number,
    variant: {
      type: String,
      default: 'tower',
      validator: (value) => ['tower', 'shooter', 'ally'].includes(value)
    }
  }
}
</script>

<style scoped lang="scss">
.shot {
  position: absolute;
  transform-origin: 0 50%;
  pointer-events: none;
  
  &--tower {
    background: #ffeb3b;
    height: 2px;
    box-shadow: 0 0 6px rgba(255, 235, 59, 0.8);
    z-index: 6;
  }
  
  &--shooter {
    background: #ff4444;
    height: 3px;
    box-shadow: 0 0 8px rgba(255, 68, 68, 0.8);
    z-index: 5;
  }
  
  &--ally {
    background: #4a90e2;
    height: 3px;
    box-shadow: 0 0 8px rgba(74, 144, 226, 0.8);
    z-index: 5;
  }
}
</style>