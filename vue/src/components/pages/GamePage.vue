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
            class="merge-game__button merge-game__button--secondary"
          >
            Reset Game
          </button>
          <button
            @click="() => addRandomItem()"
            :disabled="emptyCellsCount === 0"
            class="merge-game__button merge-game__button--primary"
          >
            Add Random Item
          </button>
        </div>

        <div class="merge-game__status">
          <div class="merge-game__indicator">
            Moves: <span class="merge-game__moves-count">{{ moves }}</span>
          </div>
        </div>

        <div class="merge-game__board">
          <div class="grid">
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
            >
              <div
                v-if="cell.item"
                class="grid__item"
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
const hoveredCell = ref<CellPosition | null>(null)

const items: GameItem[] = [
  { id: 1, name: "Seed", color: "#8B4513", points: 10 },
  { id: 2, name: "Sapling", color: "#228B22", points: 25 },
  { id: 3, name: "Tree", color: "#006400", points: 50 },
  { id: 4, name: "Ancient Tree", color: "#004d00", points: 100 },
  { id: 5, name: "Forest", color: "#003300", points: 200 },
  { id: 6, name: "Mystical Forest", color: "#001a00", points: 500 },
  { id: 7, name: "World Tree", color: "#000000", points: 1000 },
  { id: 8, name: "Cosmic Tree", color: "#4B0082", points: 2500 }
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

<style scoped lang="scss">
.merge-game {
  $self: &;
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  &__container {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  &__header {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 2rem;
    text-align: center;
  }

  &__title {
    color: white;
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 2.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  &__info {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  &__score-container {
    display: flex;
    gap: 1.5rem;
  }

  &__main {
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    gap: 2rem;
    min-height: 800px;
    align-items: start;

  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      background-color: #42b883;
      color: white;

      &:hover:not(:disabled) {
        background-color: #369870;
      }
    }

    &--secondary {
      background-color: #3498db;
      color: white;

      &:hover:not(:disabled) {
        background-color: #2980b9;
      }
    }

    &--danger {
      background-color: #e74c3c;
      color: white;

      &:hover:not(:disabled) {
        background-color: #c0392b;
      }
    }
  }

  &__status {
    text-align: center;
    margin-bottom: 1rem;
  }

  &__indicator {
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #2c3e50;
  }

  &__board {
    background: #f0f0f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
    min-height: 700px;
    display: flex;
    flex-direction: column;
  }

  &__reference {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    max-height: 700px;
    overflow-y: auto;
  }

  &__reference-title {
    margin-bottom: 1rem;
    color: #2c3e50;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
  }
}

.score-box {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  min-width: 150px;
  backdrop-filter: blur(10px);

  &__label {
    display: block;
    font-size: 0.875rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
  }

  &__value {
    display: block;
    font-size: 1.75rem;
    font-weight: bold;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 0.75rem;
  aspect-ratio: 1 / 1;
  background: #bbada0;
  padding: 1rem;
  border-radius: 0.5rem;
  touch-action: none;
  flex: 1;
  min-height: 600px;

  &__cell {
    background: #eee4da;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;

    &--empty {
      background: rgba(238, 228, 218, 0.35);

      &::after {
        content: '';
        position: absolute;
        width: 20%;
        height: 20%;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
      }
    }

    &--hovered {
      transform: scale(1.08);
      z-index: 1;
      box-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
    }
  }

  &__item {
    width: 95%;
    height: 95%;
    border-radius: 0.5rem;
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

    &:active {
      cursor: grabbing;
    }

    &--dragging {
      opacity: 0.7;
      transform: scale(1.2) rotate(5deg);
      z-index: 1000;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
    }

    &-name {
      font-size: 0.5rem;
      opacity: 0.9;
      margin-top: 0.25rem;
      padding: 0 0.25rem;
      text-align: center;
      line-height: 1.1;
      max-width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-level {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      background: rgba(0, 0, 0, 0.4);
      color: white;
      font-size: 0.5rem;
      padding: 0.125rem 0.375rem;
      border-radius: 0.5rem;
      font-weight: bold;
      min-width: 1rem;
      text-align: center;
      line-height: 1.2;
    }
  }
}

.merge-chain {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  &__items {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    flex-wrap: nowrap;
    width: 100%;
  }

  &__source {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__source-item {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.375rem;
    color: white;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    cursor: help;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    }
  }

  &__item-level {
    font-size: 0.875rem;
    font-weight: bold;
  }

  &__plus {
    font-size: 0.875rem;
    font-weight: bold;
    color: #667eea;
    min-width: 0.75rem;
    text-align: center;
  }

  &__equals {
    font-size: 0.875rem;
    font-weight: bold;
    color: #42b883;
    min-width: 0.75rem;
    text-align: center;
  }

  &__result {
    width: 3rem;
    height: 3rem;
    border-radius: 0.375rem;
    color: white;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    cursor: help;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
    }
  }

  &__points {
    font-size: 0.5rem;
    background: rgba(255, 255, 255, 0.25);
    padding: 0.125rem 0.375rem;
    border-radius: 0.5rem;
    margin-top: 0.125rem;
    line-height: 1.2;
  }
}
</style>
