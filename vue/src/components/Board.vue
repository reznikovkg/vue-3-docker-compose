<template>
  <div class="Board" :style="boardStyles">
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
import BoardCell from './BoardCell.vue'

const props = defineProps({
  board: { type: Object, required: true }
})

const boardStyles = computed(() => ({
  gridTemplateRows: `repeat(${props.board.size.rows}, 1fr)`,
  gridTemplateColumns: `repeat(${props.board.size.columns}, 1fr)`
}))
</script>

<style scoped>
.Board {
  grid-area: board;
  display: grid;
  grid-gap: 2px;
  width: min(45vh, 70vw);
  height: min(90vh, 140vw);
  max-width: 500px;
  max-height: 1000px;
  margin: 0 auto;
  background: linear-gradient(145deg, #ee5a24, #ffff6b);
  border: 4px solid rgb(255, 255, 255);
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

@media (max-width: 768px) {
  .Board {
    width: min(40vh, 85vw);
    height: min(80vh, 170vw);
  }
}
</style>