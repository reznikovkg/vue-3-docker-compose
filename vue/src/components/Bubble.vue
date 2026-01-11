<template>
  <div class="bubble" :style="bubbleStyle">
    <div class="bubble__highlight"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  size: { type: Number, required: true },
  color: { type: String, required: true }
})

const bubbleStyle = computed(() => ({
  left: props.x + 'px',
  top: props.y + 'px',
  width: props.size + 'px',
  height: props.size + 'px',
  background: `radial-gradient(circle at 30% 30%, 
    ${props.color}dd 0%, ${props.color} 50%, ${props.color}88 100%)`
}))
</script>

<style scoped lang="less">
.bubble {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 
    inset -8px -8px 20px rgba(0, 0, 0, 0.25),
    inset 8px 8px 25px rgba(255, 255, 255, 0.6),
    0 8px 30px rgba(0, 0, 0, 0.3);
  z-index: 1;

  &__highlight {
    position: absolute;
    top: 15%;
    left: 25%;
    width: 35%;
    height: 35%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.95), transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
}
</style>