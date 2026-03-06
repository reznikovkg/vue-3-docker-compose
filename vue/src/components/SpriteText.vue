<template>
  <div class="sprite-text">
    <span
        v-for="(char, index) in characters"
        :key="index"
        class="sprite-text__char"
        :style="getCharStyle(char)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: String,
  config: Object
})

const characters = computed(() => props.text.split(''))

const getCharStyle = (char) => {
  const map = props.config.spriteMap[char.toUpperCase()] || props.config.spriteMap[' ']
  if (!map) return {}

  const fontSize = props.config.fontSize || map.height
  const scale = fontSize / map.height

  return {
    display: 'inline-block',
    width: `${map.width}px`,
    height: `${map.height}px`,
    backgroundImage: `url(${props.config.spriteUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `-${map.x}px -${map.y}px`,
    backgroundSize: 'auto',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    verticalAlign: 'top'
  }
}
</script>

<style scoped lang="less">
.sprite-text {
  display: inline-flex;

  &__char {
    display: inline-block;
    background-repeat: no-repeat;
  }
}
</style>
