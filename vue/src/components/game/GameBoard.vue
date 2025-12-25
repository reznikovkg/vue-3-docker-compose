<template>
  <div class="outer-board">
    <div class="game-board" :style="boardStyle">
      <div
        v-for="cell in gridFlut"
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
        >
          <div v-if="cell.bonus" class="gem__bonus" :class="`gem__bonus--${cell.bonus}`">
            {{ getBonusSymbol(cell.bonus) }}
          </div>
          <div v-if="cell.hasCrystal" class="gem__crystal">✦</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const grid = computed(() => store.getters.grid || [])
const gridFlut = computed(() => {
  const gridValue = grid.value
  return Array.isArray(gridValue) ? gridValue.flat() : []
})
const gridSize = computed(() => store.getters.gridSize)
const selectedCell = computed(() => store.getters.selectedCell)
const matchedSet = computed(() => store.getters.matchedSet)
const animatingRevert = computed(() => store.getters.animatingRevert)
const revertIds = computed(() => store.getters.revertIds)
const isProcessing = computed(() => store.getters.isProcessing)

const BOARD_PIXELS = 500
const BOARD_PADDING = 10
const GAP_PX = 4

const cellSizePx = computed(() => {
  const inner = BOARD_PIXELS - 2 * BOARD_PADDING - (GAP_PX * (gridSize.value - 1))
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
    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
    border: '3px solid rgba(255,255,255,0.15)',
    boxSizing: 'border-box'
  }
})

const getBonusSymbol = (bonusType) => {
  const symbols = {
    bomb: 'B',
    vertical: 'V',
    horizontal: 'H',
    random: '?',
    time: 'T',
    crystal_hunter: 'C'
  }
  return symbols[bonusType] || '?'
}

const onCellClick = (cell) => {
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
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  transition: all 0.2s ease;
  user-select: none;
  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.12);
  }
}

.game-cell--selected {
  outline: 3px solid rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.15);
  transform: scale(1.05);
}

.game-cell--matched {
  .gem {
    animation: pop 0.5s ease-in-out forwards;
  }
}

.game-cell--invalid {
  background: rgba(255,100,100,0.2);
  outline: 2px solid rgba(255,100,100,0.5);
}

.gem {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.3),
    inset 0 -4px 6px rgba(0,0,0,0.2),
    inset 0 4px 6px rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-weight: bold;
}

.gem__bonus {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.gem__crystal {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 10px;
  color: gold;
  text-shadow: 0 0 3px rgba(0,0,0,0.8);
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