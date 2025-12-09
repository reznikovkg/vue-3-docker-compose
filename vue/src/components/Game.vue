<template>
  <div class="game">
    <TetrominoEditor 
      v-if="showEditor" 
      @close="() => closeEditor()" 
    />
    <BoardSizeSelector
      v-else-if="showSizeSelector"
      @start="handleSizeSelected"
      @back="() => showSizeSelector = false"
    />
    <Menu 
      v-else-if="gameOver" 
      @start="() => showSizeSelector = true" 
      @openEditor="() => openEditor()"
    />
    <Tetris 
      v-else 
      :rows="boardRows" 
      :columns="boardColumns" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Menu from './Menu.vue'
import Tetris from './Tetris.vue'
import TetrominoEditor from './TetrominoEditor.vue'
import BoardSizeSelector from './BoardSizeSelector.vue'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})

const store = useStore()
const showEditor = ref(false)
const showSizeSelector = ref(false)

// Размеры поля (по умолчанию из props)
const boardRows = ref(props.rows)
const boardColumns = ref(props.columns)

const gameOver = computed(() => store.getters['game/gameOver'])

const handleSizeSelected = ({ rows, columns }) => {
  boardRows.value = rows
  boardColumns.value = columns
  showSizeSelector.value = false
  
  // Сохраняем выбранные размеры
  try {
    localStorage.setItem('tetris_board_rows', rows.toString())
    localStorage.setItem('tetris_board_columns', columns.toString())
  } catch (e) {
    console.warn('Не удалось сохранить размеры поля')
  }
  
  // Обновляем размеры в store перед запуском игры
  store.commit('board/SET_BOARD_SIZE', { rows, columns })
  
  // Запускаем игру
  startGame()
}

const startGame = () => {
  store.dispatch('game/startGame')
}

const openEditor = () => {
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
}

// Загружаем сохраненные фигуры и размеры при монтировании
onMounted(() => {
  store.dispatch('tetrominoes/loadFromStorage')
  
  // Загружаем сохраненные размеры поля
  try {
    const savedRows = localStorage.getItem('tetris_board_rows')
    const savedColumns = localStorage.getItem('tetris_board_columns')
    
    if (savedRows) boardRows.value = parseInt(savedRows)
    if (savedColumns) boardColumns.value = parseInt(savedColumns)
  } catch (e) {
    console.warn('Не удалось загрузить размеры поля')
  }
})
</script>

<style scoped>
.game {
  position: relative;
}
</style>