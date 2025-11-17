<template>
  <div class="outer-board">
    <div class="game-board" :style="boardStyle">
      <div
        v-for="cell in gridFlat"
        :key="cell.id"
        class="game-cell"
        :class="{
          'game-cell--selected': selectedCell && selectedCell.id === cell.id,
          'game-cell--matched': matchedSet.has(cell.id),
          'game-cell--invalid': animatingRevert && revertIds && revertIds.includes(cell.id)
        }"
        @click="onCellClick(cell)"
      >
        <div
          v-if="cell.color"
          class="gem"
          :style="{ backgroundColor: cell.color }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const grid = computed(() => store.state.game.grid)
const gridFlat = computed(() => grid.value.flat())
const gridSize = computed(() => store.state.game.gridSize)
const selectedCell = computed(() => store.state.game.selectedCell)
const matchedSet = computed(() => store.state.game.matchedSet)
const animatingRevert = computed(() => store.state.game.animatingRevert)
const revertIds = computed(() => store.state.game.revertIds)
const isProcessing = computed(() => store.state.game.isProcessing)

const BOARD_PIXELS = 450
const BOARD_PADDING = 8
const GAP_PX = 4

const cellSizePx = computed(() => {
  const inner = BOARD_PIXELS - 2 * BOARD_PADDING - (GAP_PX * (gridSize.value - 1))
  return Math.floor(inner / gridSize.value)
})

const boardStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize.value}, ${cellSizePx.value}px)`,
    gridTemplateRows: `repeat(${gridSize.value}, ${cellSizePx.value}px)`,
    gap: `${GAP_PX}px`,
    width: `${BOARD_PIXELS}px`,
    height: `${BOARD_PIXELS}px`,
    padding: `${BOARD_PADDING}px`,
    borderRadius: '10px',
    background: 'linear-gradient(145deg, #1e3c72, #2a5298)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    border: '2px solid rgba(255,255,255,0.1)',
    boxSizing: 'border-box'
  }
})

const onCellClick = (cell: any) => {
  if (isProcessing.value) return
  store.dispatch('game/selectCell', cell)
}
</script>

<style scoped lang="scss">
.outer-board {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.game-board {
  box-sizing: border-box;
}

.game-cell {
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(255,255,255,0.08);
  transition: all 0.2s ease;
  user-select: none;
  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.12);
  }

  &--selected {
    outline: 2px solid rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.15);
  }

  &--matched {
    .gem {
      animation: pop 0.5s ease-in-out forwards;
    }
  }

  &--invalid {
    background: rgba(255,100,100,0.2);
    outline: 2px solid rgba(255,100,100,0.5);
  }
}

.gem {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  box-shadow: 
    0 3px 6px rgba(0,0,0,0.3),
    inset 0 -3px 4px rgba(0,0,0,0.2),
    inset 0 3px 4px rgba(255,255,255,0.1);
}

@keyframes pop {
  0% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0.7; 
  }
  100% { 
    transform: scale(0); 
    opacity: 0; 
  }
}
</style>