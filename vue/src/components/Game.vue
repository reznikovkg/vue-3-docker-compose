<template>
  <div class="Game">
    <Menu v-if="gameOver" @start="startGame" />
    <Tetris 
      v-else 
      :rows="rows" 
      :columns="columns" 
      @game-over="setGameOver" 
    />
  </div>
</template>

<script setup>
import { useGameOver } from '../composables/useGameOver.js'
import Menu from './Menu.vue'
import Tetris from './Tetris.vue'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})

const [gameOver, setGameOver, resetGameOver] = useGameOver()

const startGame = () => {
  resetGameOver()
  console.log(`Start gameOver is ${gameOver.value}`)
}
</script>