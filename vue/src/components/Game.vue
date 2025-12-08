<template>
  <div class="game">
    <TetrominoEditor 
      v-if="showEditor" 
      @close="() => closeEditor()" 
    />
    <Menu 
      v-else-if="gameOver" 
      @start="() => startGame()" 
      @openEditor="() => openEditor()"
    />
    <Tetris 
      v-else 
      :rows="rows" 
      :columns="columns" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Menu from './Menu.vue'
import Tetris from './Tetris.vue'
import TetrominoEditor from './TetrominoEditor.vue'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})

const store = useStore()
const showEditor = ref(false)

const gameOver = computed(() => store.getters['game/gameOver'])

const startGame = () => {
  store.dispatch('game/startGame')
}

const openEditor = () => {
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
}

// Загружаем сохраненные фигуры при монтировании
onMounted(() => {
  store.dispatch('tetrominoes/loadFromStorage')
})
</script>