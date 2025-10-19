<template>
  <main class="app">
    <div>
      <SpriteText label="HELLO123" :config="config" :fontSize="63" />
      <SpriteDebug :config="config" />
    </div>
  </main>
</template>

<script setup>
import SpriteText from './components/SpriteText.vue'
import SpriteDebug from './components/SpriteDebug.vue'
import sprite from './assets/font-sprite.png'

// ⚙️ Le même mapping qu’avant
const spriteMap = {
  'A': [0, 0], 'B': [1, 0], 'C': [2, 0], 'D': [3, 0], 'E': [4, 0], 'F': [5, 0],
  'G': [0, 1], 'H': [1, 1], 'I': [2, 1], 'J': [3, 1], 'K': [4, 1], 'L': [5, 1],
  'M': [0, 2], 'N': [1, 2], 'O': [2, 2], 'P': [3, 2], 'Q': [4, 2], 'R': [5, 2],
  'S': [0, 3], 'T': [1, 3], 'U': [2, 3], 'V': [3, 3], 'W': [4, 3], 'X': [5, 3],
  'Y': [0, 4], 'Z': [1, 4],
  '0': [2, 4], '1': [3, 4], '2': [4, 4], '3': [5, 4],
  '4': [0, 5], '5': [1, 5], '6': [2, 5], '7': [3, 5], '8': [4, 5], '9': [5, 5]
}

const config = {
  spritePath: sprite,
  spriteMap,
  charWidth: 60,
  charHeight: 63,
  totalWidth: 360,
  totalHeight: 378
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  min-height: 100vh;
}
</style>
