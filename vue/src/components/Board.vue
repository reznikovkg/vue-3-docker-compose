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

const boardStyles = computed(() => ({
  gridTemplateRows: `repeat(${board.value.size.rows}, 1fr)`,
  gridTemplateColumns: `repeat(${board.value.size.columns}, 1fr)`
}))
</script>

<style lang="scss" scoped>
.board {
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

  @media (max-width: 768px) {
    width: min(40vh, 85vw);
    height: min(80vh, 170vw);
  }
}
</style>