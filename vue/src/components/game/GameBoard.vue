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
          'game-cell--invalid':
            animatingRevert && revertIds && revertIds.includes(cell.id),
          'game-cell--frozen-1': cell.effect === 'frozen' && cell.frozen === 1,
          'game-cell--frozen-2': cell.effect === 'frozen' && cell.frozen === 2,
          'game-cell--buried': cell.effect === 'buried',
          'game-cell--spiked': cell.effect === 'spiked',
          'game-cell--floating': cell.effect === 'floating',
        }"
        @click="onCellClick(cell)"
      >
        <div
          v-if="cell.color"
          class="gem"
          :style="{ backgroundColor: cell.color }"
        />
        <div v-if="cell.crystal" class="crystal">⭐</div>
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
  const inner = BOARD_PIXELS - 2 * BOARD_PADDING - GAP_PX * (gridSize.value - 1)
  return Math.floor(inner / gridSize.value)
})

const boardStyle = computed(() => {
  const size = gridSize.value
  const cellSize = cellSizePx.value
  
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
    gap: `${GAP_PX}px`,
    width: `${BOARD_PIXELS}px`,
    height: `${BOARD_PIXELS}px`,
    padding: `${BOARD_PADDING}px`,
    borderRadius: '12px',
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
  padding: 15px;
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
  position: relative;

  &:hover {
    background: rgba(255,255,255,0.12);
  }

  &--selected {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);
  }

  &--matched {
    .gem {
      animation: pop 0.5s ease-in-out forwards;
    }
  }

  &--invalid {
    background: rgba(255, 100, 100, 0.2);
    outline: 2px solid rgba(255, 100, 100, 0.5);
  }

  &--frozen-1 {
    background-color: rgba(150, 200, 255, 0.6);
    border: 4px solid #99c2ff;
    box-shadow: 0 0 8px rgba(150, 200, 255, 0.5);
  }

  &--frozen-2 {
    background-color: rgba(221, 232, 249, 0.8);
    border: 4px solid #99c2ff;
    box-shadow: 0 0 12px rgba(150, 200, 255, 0.5);
  }

  &--buried {
    border: 6px solid #654321;
    box-shadow:
      inset 0 0 10px rgba(0, 0, 0, 0.6),
      0 2px 6px rgba(0, 0, 0, 0.4);
  }

  &--spiked {
    border: 3px solid rgba(248, 47, 47, 0.8);
    box-shadow: 0 0 10px rgba(255, 80, 80, 0.6);
  }

  &--floating {
    animation: floating 2.5s ease-in-out infinite;
    box-shadow:
      0 8px 14px rgba(150, 150, 255, 0.35);
    border: 3px solid rgba(229, 208, 229, 0.8);
  }
}

.gem {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  box-shadow:
    0 3px 6px rgba(0,0,0,0.3),
    inset 0 -3px 4px rgba(0,0,0,0.2),
    inset 0 3px 4px rgba(255,255,255,0.1);
}

.crystal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2em;
  pointer-events: none;
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

@keyframes floating {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10%);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
