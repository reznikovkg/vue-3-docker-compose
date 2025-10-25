<template>
  <main>
    <SpriteGrid :config="config" />
  </main>
</template>

<script setup>
import SpriteGrid from './components/SpriteGrid.vue'
import sprite from './assets/font-sprite.png'

const spriteMap = {
  'A': [0, 0], 'B': [1, 0], 'C': [2, 0], 'D': [3, 0], 'E': [4, 0], 'F': [5, 0], 'G': [6, 0],
  'H': [0, 1], 'I': [1, 1], 'J': [2, 1], 'K': [3, 1], 'L': [4, 1], 'M': [5, 1],
  'N': [0, 2], 'O': [1, 2], 'P': [2, 2], 'Q': [3, 2], 'R': [4, 2], 'S': [5, 2], 'T': [6, 2],
  'U': [0, 3], 'V': [1, 3], 'W': [2, 3], 'X': [3, 3], 'Y': [4, 3], 'Z': [5, 3],
  '0': [0, 4], '1': [1, 4], '2': [2, 4], '3': [3, 4], '4': [4, 4],
  '5': [0, 5], '6': [1, 5], '7': [2, 5], '8': [3, 5], '9': [4, 5]
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

<style>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: white;
}
</style>
