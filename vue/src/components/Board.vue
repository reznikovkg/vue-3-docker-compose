<template>
  <div class="board" :style="boardStyles">
    <template v-for="(row, y) in board.rows" :key="y">
      <BoardCell 
        v-for="(cell, x) in row" 
        :key="`${x}-${y}`"
        :cell="cell" 
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import BoardCell from './BoardCell.vue'

const store = useStore()

const board = computed(() => store.getters['board/board'])

const boardStyles = computed(() => {
  const rows = board.value.size.rows
  const columns = board.value.size.columns
  const aspectRatio = rows / columns
  
  // Динамически вычисляем размеры в зависимости от соотношения сторон
  let maxWidth = '500px'
  let maxHeight = '1000px'
  
  if (aspectRatio > 2.5) {
    // Для узких и высоких полей
    maxWidth = '400px'
    maxHeight = '1200px'
  } else if (aspectRatio < 1.5) {
    // Для широких полей
    maxWidth = '600px'
    maxHeight = '800px'
  }
  
  return {
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    '--max-width': maxWidth,
    '--max-height': maxHeight,
    '--aspect-ratio': aspectRatio
  }
})
</script>

<style lang="scss" scoped>
.board {
  grid-area: board;
  display: grid;
  grid-gap: 2px;
  width: min(calc(var(--aspect-ratio, 2) * 45vh), 70vw);
  height: min(90vh, calc(var(--aspect-ratio, 2) * 70vw));
  max-width: var(--max-width, 500px);
  max-height: var(--max-height, 1000px);
  margin: 0 auto;
  background: linear-gradient(145deg, #ee5a24, #ffff6b);
  border: 4px solid rgb(255, 255, 255);
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

  @media (max-width: 768px) {
    width: min(calc(var(--aspect-ratio, 2) * 40vh), 85vw);
    height: min(80vh, calc(var(--aspect-ratio, 2) * 85vw));
    max-height: calc(100vh - 300px); /* Учитываем кнопки управления */
  }

  @media (max-width: 480px) {
    width: min(calc(var(--aspect-ratio, 2) * 35vh), 90vw);
    height: min(70vh, calc(var(--aspect-ratio, 2) * 90vw));
    max-height: calc(100vh - 320px);
    grid-gap: 1px;
  }
}
</style>