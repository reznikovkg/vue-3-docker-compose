<template>
  <div class="bubble" :style="bubbleStyle" />
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

<style>
@import '@/assets/bubble-game.css';
</style>