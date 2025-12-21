<template>
  <main class="merge-game">
    <div class="merge-game__container">
      <header class="merge-game__header">
        <h1 class="merge-game__title">Merge Game</h1>
        <div class="merge-game__info">
          <div class="merge-game__score-container">
            <div class="score-box">
              <span class="score-box__label">SCORE</span>
              <span class="score-box__value">{{ score.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="merge-game__main">
        <div class="merge-game__controls">
          <button
            @click="() => ResetGame()"
            :disabled="isEmptyGrid"
            class="btn btn--primary"
          >
            Reset Game
          </button>
          <button
            @click="() => addRandomItem()"
            :disabled="emptyCellsCount === 0"
            class="btn btn--primary"
          >
            Add Random Item
          </button>
        </div>

        <div class="merge-game__board merge-game__board--expanded">
          <div class="merge-game__moves">
            Moves: <span class="merge-game__moves-count">{{ moves }}</span>
          </div>

          <div class="grid grid--expanded">
            <div
              v-for="(cell, index) in gridCells"
              :key="index"
              :class="[
                'grid__cell',
                {
                  'grid__cell--empty': !cell.item,
                  'grid__cell--hovered': hoveredCell && hoveredCell.row === cell.row && hoveredCell.col === cell.col
                }
              ]"
              :data-row="cell.row"
              :data-col="cell.col"
              @dragover.prevent="handleDragOver($event, cell)"
              @dragenter.prevent="handleDragEnter($event, cell)"
              @dragleave.prevent="handleDragLeave($event, cell)"
              @drop.prevent="handleDrop($event, cell)"
              @touchstart="handleTouchStart($event, cell)"
              @touchmove.prevent="handleTouchMove"
              @touchend="handleTouchEnd($event, cell)"
            >
              <div
                v-if="cell.item"
                class="grid__item grid__item--expanded"
                :class="[
                  `grid__item--level-${cell.item.id}`,
                  { 'grid__item--dragging': draggedItem?.row === cell.row && draggedItem?.col === cell.col }
                ]"
                :style="{ backgroundColor: cell.item.color }"
                draggable="true"
                @dragstart="handleDragStart($event, cell)"
                @dragend="handleDragEnd"
              >
                <div class="grid__item-name">{{ cell.item.name }}</div>
                <div class="grid__item-level">{{ cell.item.id }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="merge-game__reference">
          <h3 class="merge-game__reference-title">Merge Hierarchy</h3>
          <div class="merge-game__rules">
            <div class="merge-chain">
              <div class="merge-chain__step" v-for="(item, index) in items.slice(0, -1)" :key="item.id">
                <div class="merge-chain__items">
                  <div class="merge-chain__source">
                    <div
                      class="merge-chain__source-item"
                      :style="{ backgroundColor: item.color }"
                      :title="`Level ${item.id}: ${item.name}`"
                    >
                      <div class="merge-chain__item-level">{{ item.id }}</div>
                    </div>
                    <span class="merge-chain__plus">+</span>
                    <div
                      class="merge-chain__source-item"
                      :style="{ backgroundColor: item.color }"
                      :title="`Level ${item.id}: ${item.name}`"
                    >
                      <div class="merge-chain__item-level">{{ item.id }}</div>
                    </div>
                  </div>

                  <span class="merge-chain__equals">=</span>

                  <div
                    class="merge-chain__result"
                    :style="{ backgroundColor: items[index + 1].color }"
                    :title="`Level ${items[index + 1].id}: ${items[index + 1].name}`"
                  >
                    <div class="merge-chain__item-level">{{ items[index + 1].id }}</div>
                    <div class="merge-chain__points">+{{ items[index + 1].points }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

interface GameItem {
  id: number;
  name: string;
  color: string;
  points: number;
}

interface GridCell {
  row: number;
  col: number;
  item: GameItem | null;
}

interface CellPosition {
  row: number;
  col: number;
}

const store = useStore()

const gridCells = computed<GridCell[]>(() => store.getters['game/getGridCells'])
const score = computed<number>(() => store.getters['game/getScore'])
const moves = computed<number>(() => store.getters['game/getMoves'])
const emptyCellsCount = computed<number>(() => store.getters['game/getEmptyCellsCount'])
const isEmptyGrid = computed<boolean>(() => store.getters['game/getIsEmptyGrid'])

const addRandomItem = () => store.dispatch('game/addRandomItem')
const ResetGame = () => store.dispatch('game/resetGame')
const MoveItem = (fromRow: number, fromCol: number, toRow: number, toCol: number) =>
  store.dispatch('game/moveItem', { fromRow, fromCol, toRow, toCol })

const draggedItem = ref<CellPosition | null>(null)
const dragStartCell = ref<CellPosition | null>(null)
const touchStart = ref<{
  x: number;
  y: number;
  cell: CellPosition;
  element: HTMLElement;
} | null>(null)
const hoveredCell = ref<CellPosition | null>(null)

const items: GameItem[] = [
  { id: 1, name: "Seed",color: "#8B4513", points: 10},
  { id: 2, name: "Sapling", color: "#228B22", points: 25 },
  { id: 3, name: "Tree", color: "#006400", points: 50},
  { id: 4, name: "Ancient Tree", color: "#004d00", points: 100 },
  { id: 5, name: "Forest", color: "#003300", points: 200},
  { id: 6, name: "Mystical Forest", color: "#001a00", points: 500 },
  { id: 7, name: "World Tree", color: "#000000", points: 1000 },
  { id: 8, name: "Cosmic Tree", color: "#4B0082", points: 2500}
]

const handleDragStart = (event: DragEvent, cell: GridCell): void => {
  if (!cell.item) return

  draggedItem.value = { row: cell.row, col: cell.col }
  dragStartCell.value = { row: cell.row, col: cell.col }

  const target = event.target as HTMLElement
  target.classList.add('grid__item--dragging')

  event.dataTransfer?.setData('text/plain', '')
}

const handleDragEnd = (): void => {
  if (draggedItem.value) {
    const draggingElements = document.querySelectorAll('.grid__item--dragging')
    draggingElements.forEach(el => el.classList.remove('grid__item--dragging'))
  }
  draggedItem.value = null
  dragStartCell.value = null
  hoveredCell.value = null
}

const handleDragOver = (event: DragEvent, cell: GridCell): void => {
  event.preventDefault()
  if (draggedItem.value) {
    hoveredCell.value = { row: cell.row, col: cell.col }
  }
}

const handleDragEnter = (event: DragEvent, cell: GridCell): void => {
  if (draggedItem.value && cell.item) {
    const target = event.target as HTMLElement
    target.classList.add('grid__cell--hovered')
  }
}

const handleDragLeave = (event: DragEvent): void => {
  const target = event.target as HTMLElement
  target.classList.remove('grid__cell--hovered')
}

const handleDrop = (event: DragEvent, cell: GridCell): void => {
  event.preventDefault()

  const target = event.target as HTMLElement
  target.classList.remove('grid__cell--hovered')

  if (dragStartCell.value) {
    MoveItem(
      dragStartCell.value.row,
      dragStartCell.value.col,
      cell.row,
      cell.col
    )
    handleDragEnd()
  }
}

const handleTouchStart = (event: TouchEvent, cell: GridCell): void => {
  if (!cell.item) return

  touchStart.value = {
    x: event.touches[0].clientX,
    y: event.touches[0].clientY,
    cell: { row: cell.row, col: cell.col },
    element: event.target as HTMLElement
  }

  dragStartCell.value = { row: cell.row, col: cell.col }
  event.target?.classList.add('grid__item--dragging')
}

const handleTouchMove = (event: TouchEvent): void => {
  if (touchStart.value) {
    event.preventDefault()
  }
}

const handleTouchEnd = (event: TouchEvent, cell: GridCell): void => {
  if (touchStart.value && dragStartCell.value) {
    const touch = event.changedTouches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const targetCellElement = element?.closest('.grid__cell')

    if (targetCellElement &&
        !(dragStartCell.value.row === cell.row && dragStartCell.value.col === cell.col)) {
      const targetRow = parseInt(targetCellElement.dataset.row!)
      const targetCol = parseInt(targetCellElement.dataset.col!)

      MoveItem(
        dragStartCell.value.row,
        dragStartCell.value.col,
        targetRow,
        targetCol
      )
    }

    touchStart.value.element.classList.remove('grid__item--dragging')
    touchStart.value = null
    dragStartCell.value = null
  }
}

onMounted(() => {
  store.dispatch('game/initializeGame')
  const handleContextMenu = (e: MouseEvent): void => {
    if ((e.target as HTMLElement).classList.contains('grid__item')) {
      e.preventDefault()
    }
  }

  document.addEventListener('contextmenu', handleContextMenu)

  onUnmounted(() => {
    document.removeEventListener('contextmenu', handleContextMenu)
  })
})
</script>

<style scoped>
.merge-game {
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.merge-game__header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 25px 30px;
  text-align: center;
}

.merge-game__title {
  font-size: 2.8em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.merge-game__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.merge-game__score-container {
  display: flex;
  gap: 20px;
}

.score-box {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px 25px;
  border-radius: 10px;
  min-width: 150px;
  backdrop-filter: blur(10px);
}

.score-box__label {
  display: block;
  font-size: 0.9em;
  opacity: 0.9;
  margin-bottom: 5px;
}

.score-box__value {
  display: block;
  font-size: 2em;
  font-weight: bold;
}

.merge-game__main {
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr 3fr 1.1fr;
  gap: 25px;
  min-height: 800px;
  align-items: start;
}

@media (max-width: 1200px) {
  .merge-game__main {
    grid-template-columns: 1fr;
  }
}

.merge-game__controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 18px 25px;
  font-size: 1.1em;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn:active {
  transform: translateY(-1px);
}

.btn--primary {
  background: linear-gradient(45deg, #4CAF50, #2E7D32);
  color: white;
}

.merge-game__board--expanded {
  background: #f0f0f0;
  border-radius: 12px;
  padding: 25px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
  min-height: 700px;
  display: flex;
  flex-direction: column;
}

.merge-game__moves {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 15px;
  text-align: right;
  padding: 0 10px;
}

.merge-game__moves-count {
  font-weight: bold;
  color: #667eea;
  font-size: 1.1em;
}

.grid--expanded {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 12px;
  aspect-ratio: 1 / 1;
  background: #bbada0;
  padding: 15px;
  border-radius: 10px;
  touch-action: none;
  flex: 1;
  min-height: 600px;
}

.grid__cell {
  background: #eee4da;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.grid__cell--empty {
  background: rgba(238, 228, 218, 0.35);
}

.grid__cell--empty::after {
  content: '';
  position: absolute;
  width: 20%;
  height: 20%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.grid__cell--hovered {
  transform: scale(1.08);
  z-index: 1;
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
}

.grid__item--expanded {
  width: 95%;
  height: 95%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  user-select: none;
  cursor: grab;
  position: relative;
  overflow: hidden;
}

.grid__item--expanded:active {
  cursor: grabbing;
}

.grid__item--dragging {
  opacity: 0.7;
  transform: scale(1.2) rotate(5deg);
  z-index: 1000;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
}

.grid__item-name {
  font-size: 0.5em;
  opacity: 0.9;
  margin-top: 1px;
  padding: 0 3px;
  text-align: center;
  line-height: 1.1;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid__item-level {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 0.5em;
  padding: 1px 4px;
  border-radius: 8px;
  font-weight: bold;
  min-width: 14px;
  text-align: center;
  line-height: 1.2;
}

.merge-game__reference {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  max-height: 700px;
  overflow: hidden;
}

.merge-game__reference-title {
  margin-bottom: 12px;
  color: #333;
  text-align: center;
  font-size: 1.1em;
  font-weight: 600;
}

.merge-chain {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.merge-chain__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.merge-chain__step:last-child {
  margin-bottom: 0;
}

.merge-chain__items {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: nowrap;
  width: 100%;
}

.merge-chain__source {
  display: flex;
  align-items: center;
  gap: 3px;
}

.merge-chain__source-item {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  cursor: help;
}

.merge-chain__source-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.merge-chain__item-level {
  font-size: 0.9em;
  font-weight: bold;
}

.merge-chain__plus {
  font-size: 0.9em;
  font-weight: bold;
  color: #667eea;
  min-width: 10px;
  text-align: center;
}

.merge-chain__equals {
  font-size: 0.9em;
  font-weight: bold;
  color: #4CAF50;
  min-width: 10px;
  text-align: center;
}

.merge-chain__result {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  cursor: help;
}

.merge-chain__result:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.merge-chain__points {
  font-size: 0.6em;
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 4px;
  border-radius: 8px;
  margin-top: 2px;
  line-height: 1.2;
}

@media (max-width: 1200px) {
  .merge-game__main {
    grid-template-columns: 1fr;
  }

  .merge-game__reference {
    min-width: auto;
    max-height: none;
    overflow: visible;
  }

  .merge-chain__items {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .merge-game__title {
    font-size: 2em;
  }

  .merge-game__info {
    flex-direction: column;
    gap: 10px;
  }

  .score-box {
    min-width: 120px;
    padding: 10px 15px;
  }

  .grid--expanded {
    gap: 6px;
    padding: 8px;
    min-height: 400px;
  }

  .merge-game__moves {
    font-size: 0.85em;
    margin-bottom: 10px;
  }

  .grid__item-name {
    display: none;
  }

  .grid__item-level {
    font-size: 0.4em;
    top: 3px;
    right: 3px;
    padding: 1px 3px;
  }

  .btn {
    padding: 15px;
    font-size: 1em;
  }

  .merge-game__main {
    padding: 20px;
    gap: 20px;
  }

  .merge-chain {
    gap: 8px;
  }

  .merge-chain__step {
    gap: 6px;
  }

  .merge-chain__items {
    gap: 4px;
  }

  .merge-chain__source {
    flex-direction: row;
    gap: 2px;
  }

  .merge-chain__source-item {
    width: 35px;
    height: 35px;
  }

  .merge-chain__result {
    width: 42px;
    height: 42px;
  }

  .merge-chain__plus,
  .merge-chain__equals {
    font-size: 0.8em;
  }

  .merge-chain__item-level {
    font-size: 0.8em;
  }

  .merge-chain__points {
    font-size: 0.55em;
  }
}

@media (max-width: 480px) {
  .grid--expanded {
    aspect-ratio: 1 / 1;
    min-height: 350px;
  }

  .merge-game__controls {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    min-width: 120px;
  }

  .merge-chain__items {
    flex-direction: row;
  }

  .merge-chain__source {
    flex-direction: row;
  }

  .merge-chain__source-item {
    width: 30px;
    height: 30px;
  }

  .merge-chain__result {
    width: 36px;
    height: 36px;
  }

  .grid__item-level {
    font-size: 0.35em;
  }
}
</style>