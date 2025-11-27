<template>
  <div class="preview">
    <div class="preview-title">
      {{ previewTitles[index] || `Через ${index}` }}
    </div>
    <div class="preview-board">
      <template v-for="(row, y) in board.rows" :key="y">
        <BoardCell 
          v-for="(cell, x) in row" 
          :key="`${x}-${y}`"
          :cell="cell" 
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { buildBoard } from '../business/Board.js'
import { transferToBoard } from '../business/Tetrominoes.js'
import BoardCell from './BoardCell.vue'

const props = defineProps({
  tetromino: { type: Object, required: true },
  index: { type: Number, required: true }
})

const previewTitles = ["Следующая фигура", "Через 1", "Через 2", "Через 3"]

const board = computed(() => {
  const { shape, className } = props.tetromino
  const board = buildBoard({ rows: 4, columns: 4 })
  
  board.rows = transferToBoard({
    className,
    isOccupied: false,
    position: { row: 0, column: 0 },
    rows: board.rows,
    shape,
  })
  
  return board
})
</script>

<style scoped>
.preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-board {
  display: grid;
  grid-gap: 2px;
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: repeat(4, 1fr);
  width: min(90px, 10vw);
  height: min(90px, 10vw);
  min-width: 70px;
  min-height: 70px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 5px;
}

.preview-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: min(1rem, 2vh);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .preview {
    gap: 5px;
  }

  .preview-board {
    width: min(70px, 8vw);
    height: min(70px, 8vw);
    min-width: 50px;
    min-height: 50px;
  }

  .preview-title {
    font-size: min(0.9rem, 1.8vh);
  }
}
</style>