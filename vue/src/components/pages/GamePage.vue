<template>
  <main class="merge-game">
    <div class="game-container">
      <header class="game-header">
        <h1 class="game-title">Merge Game</h1>

        <div class="game-info">
          <div class="score-container">
            <div class="score-box">
              <span class="label">SCORE</span>
              <span class="value">{{ score.toLocaleString() }}</span>
            </div>
            <div class="score-box">
              <span class="label">BEST</span>
              <span class="value">{{ highScore.toLocaleString() }}</span>
            </div>
            <div class="level-box">
              <span class="label">LEVEL</span>
              <span class="value">{{ maxLevelReached }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="game-main">
        <div class="controls">
          <button
            @click="() => AddRandomItem()"
            :disabled="emptyCellsCount === 0"
            class="btn btn-primary"
          >
            <span class="icon"></span>
            Add Random Item
          </button>


          <button
            @click="() => ResetGame()"
            :disabled="isEmptyGrid"
            class="btn btn-danger"
          >
            <span class="icon"></span>
            Reset Game
          </button>
        </div>

        <div class="game-board">
          <div class="board-header">
            <h3 class="board-title">Game Board (8×8)</h3>
            <div class="moves">
              Moves: <span class="moves-count">{{ moves }}</span>
            </div>
          </div>

          <div class="grid">
            <div
              v-for="(cell, index) in gridCells"
              :key="index"
              :class="['cell', { 'empty': !cell.item, 'hovered': hoveredCell && hoveredCell.row === cell.row && hoveredCell.col === cell.col }]"
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
                class="item"
                :class="`item--level-${cell.item.id} dragging`"
                :style="{ backgroundColor: cell.item.color }"
                draggable="true"
                @dragstart="handleDragStart($event, cell)"
                @dragend="handleDragEnd"
              >
                <div class="item-emoji">{{ cell.item.emoji }}</div>
                <div class="item-name">{{ cell.item.name }}</div>
                <div class="item-level">{{ cell.item.id }}</div>
              </div>
            </div>
          </div>

          <div class="board-footer">
            <div class="empty-cells">
              Empty cells: <span class="empty-count">{{ emptyCellsCount }}</span>
            </div>
          </div>
        </div>

        <div class="game-stats">
          <div class="stat-card">
            <h3> Statistics</h3>
            <ul class="stats-list">
              <li class="stats-item">
                <span class="stats-label">Items merged:</span>
                <span class="stats-value">{{ mergedCount }}</span>
              </li>
              <li class="stats-item">
                <span class="stats-label">Highest item:</span>
                <span class="stats-value">{{ highestItemName }}</span>
              </li>
              <li class="stats-item">
                <span class="stats-label">Play time:</span>
                <span class="stats-value">{{ formattedPlayTime }}</span>
              </li>
            </ul>
          </div>

          <div class="stat-card">
            <h3> Progress</h3>
            <div class="goal">
              <div class="goal-text">
                Reach level 8 item! (Current: {{ maxLevelReached }})
              </div>
              <div class="progress-bar">
                <div
                  class="progress"
                  :style="{ width: `${(maxLevelReached / 8) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="items-reference">
        <h3>Items Hierarchy</h3>
        <div class="items-list">
          <div
            v-for="item in items"
            :key="item.id""
            class="guide-item"
            :style="{ backgroundColor: item.color }"
          >
            <div class="guide-emoji">{{ item.emoji }}</div>
            <div class="guide-name">{{ item.name }}</div>
            <div class="guide-level">Level: {{ item.id }}</div>
            <div class="guide-points">{{ item.points }} pts</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showGameOver" class="modal-overlay" @click.self="() => HideGameOver()">
      <div class="modal-content">
        <h2 class="modal-title"> Congratulations!</h2>
        <p class="modal-text">You reached the maximum level!</p>

        <div class="modal-stats">
          <div class="modal-stat">
            <span class="modal-stat-label">Final Score:</span>
            <span class="modal-stat-value">{{ score.toLocaleString() }}</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-label">Highest Item:</span>
            <span class="modal-stat-value">{{ highestItemName }}</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-label">Total Merges:</span>
            <span class="modal-stat-value">{{ mergedCount }}</span>
          </div>
        </div>

        <button @click="() =>NewGame()" class="btn btn-primary">
           New Game
        </button>
      </div>
    </div>

    <div
      v-if="notification.show"
      :class="['notification', `notification--${notification.type}`]"
    >
      {{ notification.message }}
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
  emoji: string;
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
const highScore = computed<number>(() => store.getters['game/getHighScore'])
const moves = computed<number>(() => store.getters['game/getMoves'])
const mergedCount = computed<number>(() => store.getters['game/getMergedCount'])
const maxLevelReached = computed<number>(() => store.getters['game/getMaxLevelReached'])
const showGameOver = computed<boolean>(() => store.getters['game/getShowGameOver'])
const notification = computed(() => store.getters['game/getNotification'])
const emptyCellsCount = computed<number>(() => store.getters['game/getEmptyCellsCount'])
const formattedPlayTime = computed<string>(() => store.getters['game/getFormattedPlayTime'])
const isEmptyGrid = computed<boolean>(() => store.getters['game/getIsEmptyGrid'])


const AddRandomItem = () => store.dispatch('game/addRandomItem')
const ResetGame = () => store.dispatch('game/resetGame')
const NewGame = () => store.dispatch('game/newGame')
const HideGameOver = () => store.dispatch('game/hideGameOver')
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
  { id: 1, name: "Seed", color: "#8B4513", points: 10, emoji: "🌱" },
  { id: 2, name: "Sapling", color: "#228B22", points: 25, emoji: "🌿" },
  { id: 3, name: "Tree", color: "#006400", points: 50, emoji: "🌳" },
  { id: 4, name: "Ancient Tree", color: "#004d00", points: 100, emoji: "🪵" },
  { id: 5, name: "Forest", color: "#003300", points: 200, emoji: "🌲" },
  { id: 6, name: "Mystical Forest", color: "#001a00", points: 500, emoji: "🧚" },
  { id: 7, name: "World Tree", color: "#000000", points: 1000, emoji: "🌍" },
  { id: 8, name: "Cosmic Tree", color: "#4B0082", points: 2500, emoji: "✨" }
]


const highestItemName = computed<string>(() => {
  const item = items.find(item => item.id === maxLevelReached.value)
  return item ? `${item.name} (${item.id})` : 'None'
})


const handleDragStart = (event: DragEvent, cell: GridCell): void => {
  if (!cell.item) return

  draggedItem.value = { row: cell.row, col: cell.col }
  dragStartCell.value = { row: cell.row, col: cell.col }

  const target = event.target as HTMLElement
  target.classList.add('dragging')

  event.dataTransfer?.setData('text/plain', '')
}

const handleDragEnd = (): void => {
  if (draggedItem.value) {
    const draggingElements = document.querySelectorAll('.item.dragging')
    draggingElements.forEach(el => el.classList.remove('dragging'))
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
    target.classList.add('hovered')
  }
}

const handleDragLeave = (event: DragEvent): void => {
  const target = event.target as HTMLElement
  target.classList.remove('hovered')
}

const handleDrop = (event: DragEvent, cell: GridCell): void => {
  event.preventDefault()

  const target = event.target as HTMLElement
  target.classList.remove('hovered')

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
  event.target?.classList.add('dragging')
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
    const targetCellElement = element?.closest('.cell')

    if (targetCellElement &&
        !(dragStartCell.value.row === cell.row && dragStartCell.value.col === cell.col)) {
      const targetRow = parseInt(targetCellElement.dataset.row!)
      const targetCol = parseInt(targetCellElement.dataset.col!)

      handleMoveItem(
        dragStartCell.value.row,
        dragStartCell.value.col,
        targetRow,
        targetCol
      )
    }

    touchStart.value.element.classList.remove('dragging')
    touchStart.value = null
    dragStartCell.value = null
  }
}

const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'r' && e.ctrlKey) {
    e.preventDefault()
    ResetGame()
  } else if (e.key === 'a' && e.ctrlKey) {
    e.preventDefault()
    AddRandomItem()
  }
   else if (e.key === 'Escape') {
    HideGameOver()
  }
}


onMounted(() => {
  store.dispatch('game/initializeGame')

  document.addEventListener('keydown', handleKeyDown)

  const handleContextMenu = (e: MouseEvent): void => {
    if ((e.target as HTMLElement).classList.contains('item')) {
      e.preventDefault()
    }
  }

  document.addEventListener('contextmenu', handleContextMenu)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('contextmenu', handleContextMenu)
  })
})

</script>

<style scoped>
.merge-game {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-container {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.game-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 25px 30px;
  text-align: center;
}

.game-header h1 {
  font-size: 2.8em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.score-container {
  display: flex;
  gap: 20px;
}

.score-box, .level-box {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px 25px;
  border-radius: 10px;
  min-width: 150px;
  backdrop-filter: blur(10px);
}

.score-box .label, .level-box .label {
  display: block;
  font-size: 0.9em;
  opacity: 0.9;
  margin-bottom: 5px;
}

.score-box .value, .level-box .value {
  display: block;
  font-size: 2em;
  font-weight: bold;
}

.game-main {
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  gap: 30px;
}

@media (max-width: 1200px) {
  .game-main {
    grid-template-columns: 1fr;
  }
}

.controls {
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

.btn-primary {
  background: linear-gradient(45deg, #4CAF50, #2E7D32);
  color: white;
}

.btn-secondary {
  background: linear-gradient(45deg, #2196F3, #1565C0);
  color: white;
}

.btn-danger {
  background: linear-gradient(45deg, #f44336, #c62828);
  color: white;
}

.icon {
  font-size: 1.2em;
}

.game-board {
  background: #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
}

.board-header, .board-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 8px;
  aspect-ratio: 1 / 1;
  background: #bbada0;
  padding: 10px;
  border-radius: 8px;
  touch-action: none;
}

.cell {
  background: #eee4da;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cell.empty {
  background: rgba(238, 228, 218, 0.35);
}

.cell.empty::after {
  content: '';
  position: absolute;
  width: 20%;
  height: 20%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.cell.hovered {
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.item {
  width: 90%;
  height: 90%;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  user-select: none;
  cursor: grab;
  position: relative;
  overflow: hidden;
}

.item:active {
  cursor: grabbing;
}

.item.dragging {
  opacity: 0.7;
  transform: scale(1.15) rotate(5deg);
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.item.level-1 { background: linear-gradient(45deg, #8B4513, #A0522D); }
.item.level-2 { background: linear-gradient(45deg, #228B22, #32CD32); }
.item.level-3 { background: linear-gradient(45deg, #006400, #228B22); }
.item.level-4 { background: linear-gradient(45deg, #004d00, #006400); }
.item.level-5 { background: linear-gradient(45deg, #003300, #004d00); }
.item.level-6 { background: linear-gradient(45deg, #001a00, #003300); }
.item.level-7 { background: linear-gradient(45deg, #000000, #333333); }
.item.level-8 { background: linear-gradient(45deg, #4B0082, #8A2BE2); }

.item-name {
  font-size: 0.7em;
  opacity: 0.9;
  margin-top: 2px;
}

.item-level {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 0.6em;
  padding: 2px 6px;
  border-radius: 10px;
}

.game-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin-bottom: 15px;
  color: #667eea;
}

.progress-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  margin-top: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(45deg, #4CAF50, #2E7D32);
  transition: width 0.5s ease;
}

.stats-list {
  list-style: none;
}

.stats-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.stats-list li:last-child {
  border-bottom: none;
}

.instructions {
  background: #f8f9fa;
  padding: 25px 30px;
  border-radius: 12px;
  margin: 0 30px 30px;
}

.instructions h3 {
  margin-bottom: 20px;
  color: #333;
}

.instructions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.instruction {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.instruction-icon {
  font-size: 2em;
}

.items-reference {
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  margin: 0 30px 30px;
}

.items-reference h3 {
  margin-bottom: 20px;
  color: #333;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.guide-item {
  flex: 1;
  min-width: 120px;
  padding: 15px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.guide-item:hover {
  transform: translateY(-3px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  max-width: 500px;
  text-align: center;
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-stats {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.info {
  background: #4CAF50;
}

.notification.warning {
  background: #ff9800;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .game-header h1 {
    font-size: 2em;
  }

  .game-info {
    flex-direction: column;
    gap: 10px;
  }

  .score-box, .level-box {
    min-width: 120px;
    padding: 10px 15px;
  }

  .grid {
    gap: 5px;
    padding: 5px;
  }

  .item-name {
    display: none;
  }

  .instruction {
    flex-direction: column;
    text-align: center;
  }

  .btn {
    padding: 15px;
    font-size: 1em;
  }

  .game-main,
  .instructions,
  .items-reference {
    padding: 20px;
    margin: 0 0 20px;
  }
}

@media (max-width: 480px) {
  .grid {
    aspect-ratio: 1 / 1;
  }

  .controls {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    min-width: 120px;
  }

  .items-list {
    flex-direction: column;
  }

  .guide-item {
    min-width: auto;
  }
}
</style>