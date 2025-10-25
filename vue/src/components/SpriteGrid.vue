<template>
  <div class="sprite-grid">
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      class="sprite-grid__row"
    >
      <div
        v-for="(char, colIndex) in row"
        :key="colIndex"
        class="sprite-grid__char"
        :style="getCharStyle(char)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  config: Object
})

// Chaque ligne correspond à ce que tu as décrit :
const rows = computed(() => [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],        // 1ère ligne
  ['H', 'I', 'J', 'K', 'L', 'M'],             // 2e ligne
  ['N', 'O', 'P', 'Q', 'R', 'S', 'T'],       // 3e ligne
  ['U', 'V', 'W', 'X', 'Y', 'Z'],            // 4e ligne
  ['0', '1', '2', '3', '4'],                 // 5e ligne
  ['5', '6', '7', '8', '9']                  // 6e ligne
])

// Fonction pour positionner chaque caractère dans le sprite
const getCharStyle = (char) => {
  const pos = props.config.spriteMap[char] ?? [0, 0]
  const [col, row] = pos
  const x = -col * props.config.charWidth
  const y = -row * props.config.charHeight

  return {
    width: props.config.charWidth + 'px',
    height: props.config.charHeight + 'px',
    backgroundImage: `url(${props.config.spritePath})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${x}px ${y}px`,
    backgroundSize: `${props.config.totalWidth}px ${props.config.totalHeight}px`
  }
}
</script>

<style lang="less" scoped>
.sprite-grid {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__row {
    display: flex;
    justify-content: center;
  }

  &__char {
    border: 1px solid #ddd;
  }
}
</style>
