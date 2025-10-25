<template>
  <div class="sprite-text" :style="{ height: fontSize + 'px' }">
    <div
      v-for="(char, i) in labelChars"
      :key="i"
      class="sprite-text__char"
      :style="getCharStyle(char)"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  config: Object,
  fontSize: { type: Number, default: 60 }
})

const labelChars = computed(() => props.label.toUpperCase().split(''))

const getCharStyle = (char) => {
  const pos = props.config.spriteMap[char] ?? [0, 0]
  const [col, row] = pos
  const x = -col * props.config.charWidth
  const y = -row * props.config.charHeight

  return {
    width: `${props.config.charWidth}px`,
    height: `${props.config.charHeight}px`,
    backgroundImage: `url(${props.config.spritePath})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${x}px ${y}px`,
    backgroundSize: `${props.config.totalWidth}px ${props.config.totalHeight}px`,
    transform: `scale(${props.fontSize / props.config.charHeight})`,
    transformOrigin: 'top left'
  }
}
</script>
