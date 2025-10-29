<template>
  <div class="sprite-text-container">
    <!-- Texte principal -->
    <div class="sprite-text">
      <div
        v-for="(char, index) in chars"
        :key="'text-' + index"
        class="sprite-text__char"
        :style="getCharStyle(char)"
      ></div>
    </div>

    <!-- Palette complète par lignes -->
    <div class="sprite-palette">
      <div class="sprite-line" v-for="(line, rowIndex) in spriteLines" :key="'line-' + rowIndex">
        <div
          v-for="char in line"
          :key="'char-' + char"
          class="sprite-text__char"
          :style="getCharStyle(char)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import sprite from '../assets/font-sprite.png'

const cols = 8
const rows = 5
const spriteWidth = 360
const spriteHeight = 225
const charWidth = spriteWidth / cols
const charHeight = spriteHeight / rows

const spriteMap = {
  'A': [0, 0], 'B': [1, 0], 'C': [2, 0], 'D': [3, 0], 'E': [4, 0], 'F': [5, 0], 'G': [6, 0], 'H': [7, 0],
  'I': [0, 1], 'J': [1, 1], 'K': [2, 1], 'L': [3, 1], 'M': [4, 1], 'N': [5, 1], 'O': [6, 1], 'P': [7, 1],
  'Q': [0, 2], 'R': [1, 2], 'S': [2, 2], 'T': [3, 2], 'U': [4, 2], 'V': [5, 2], 'W': [6, 2], 'X': [7, 2],
  'Y': [0, 3], 'Z': [1, 3], '0': [2, 3], '1': [3, 3], '2': [4, 3], '3': [5, 3], '4': [6, 3], '5': [7, 3],
  '6': [0, 4], '7': [1, 4], '8': [2, 4], '9': [3, 4], '$': [4, 4], ':': [5, 4], '?': [6, 4], '!': [7, 4],
  ' ': null
}

// Lignes du sprite pour palette
const spriteLines = [
  ['A','B','C','D','E','F','G','H'],
  ['I','J','K','L','M','N','O','P'],
  ['Q','R','S','T','U','V','W','X'],
  ['Y','Z','0','1','2','3','4','5'],
  ['6','7','8','9','$',':','?','!']
]

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const chars = props.text.toUpperCase().split('')

const getCharStyle = (char) => {
  const pos = spriteMap[char]
  if (!pos) return { width: `${charWidth}px`, height: `${charHeight}px` }

  const [x, y] = pos
  return {
    width: `${charWidth}px`,
    height: `${charHeight}px`,
    backgroundImage: `url(${sprite})`,
    backgroundSize: `${spriteWidth}px ${spriteHeight}px`,
    backgroundPosition: `-${x * charWidth}px -${y * charHeight}px`,
    display: 'inline-block'
  }
}
</script>

<style scoped lang="less">
.sprite-text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.sprite-text {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;

  &__char {
    image-rendering: pixelated;
    background-repeat: no-repeat;
  }
}

.sprite-palette {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .sprite-line {
    display: flex;
    gap: 4px;
  }
}
</style>
