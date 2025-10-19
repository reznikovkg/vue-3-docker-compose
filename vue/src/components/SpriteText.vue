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

// Définition des props
const props = defineProps({
  label: { type: String, required: true },
  config: { type: Object, required: true },
  fontSize: { type: Number, default: 60 }
})

// Convertit le label en tableau de caractères
const labelChars = computed(() => props.label.toUpperCase().split(''))

// Fonction fléchée pour récupérer le style de chaque caractère
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

<style lang="less" scoped>
@import '@/styles/sprite-text.less';
</style>
