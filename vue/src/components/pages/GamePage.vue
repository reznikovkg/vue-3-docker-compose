<template>
  <div class="game-page">
    <div class="game-page__header">
      <div class="game-page__score">
        Очки: {{ score }}
      </div>
      <div class="game-page__controls">
        <button class="game-page__button" @click="addRandomItem" :disabled="gameOver"> Добавить предмет</button>
        <button class="game-page__button" @click="resetGame">Новая игра</button>
      </div>
    </div>

    <div class="game-page__overlay" v-if="gameOver" @click="resetGame">
      <div class="game-page__message">
        <h2 class="game-page__title">{{ gameOverMessage }}</h2>
        <p class="game-page__text">Ваш счет: {{ score }}</p>
        <button class="game-page__play-again" @click="resetGame">Играть снова</button>
      </div>
    </div>

    <GameGrid
      :grid="grid"
      :gridSize="gridSize"
      :draggedItem="draggedItem"
      :gameOver="gameOver"
      @dragStart="handleDragStart"
      @drop="handleDrop"
    />

    <div class="game-page__size-controls">
      <button 
        v-for="size in [8, 10, 12]" 
        :key="size"
        class="game-page__size-button"
        @click="() => changeGridSize(size)"
        :disabled="gameOver"
      >
        {{ size }}x{{ size }}
      </button>
    </div>

    <div class="game-page__progress">
      <div class="game-page__progress-bar">
        <div class="game-page__progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="game-page__progress-text">
        Прогресс до победы: {{ itemsMerged }}/{{ WIN_CONDITION }}
      </div>
    </div>
  </div>
</template>

<script>
import GameGrid from '../ui/GameGrid.vue'
const WIN_CONDITION = 20
const MAX_LEVEL = 10
const LOSE_CONDITION = 3
const STORAGE_KEY = 'pair-game-save'

export default {
  name: 'GamePage',
  components: {
    GameGrid
  },
  inject: ['store'],
  data() {
    return {
      gridSize: 8,
      grid: [],
      score: 0,
      draggedItem: null,
      itemsMerged: 0,
      noSpaceCount: 0,
      gameOver: false,
      gameWon: false
    }
  },
  computed: {
    gameOverMessage() {
      if (this.gameWon) return 'Поздравляем! Вы победили!'
      return 'Игра окончена!'
    },
    progressPercentage() {
      return Math.min((this.itemsMerged / WIN_CONDITION) * 100, 100)
    }
  },
  mounted() {
    this.loadFromStorage()
  },
   methods: {
    saveToStorage() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          gridSize: this.gridSize,
          grid: this.grid,
          score: this.score,
          itemsMerged: this.itemsMerged,
          noSpaceCount: this.noSpaceCount,
          gameOver: this.gameOver,
          gameWon: this.gameWon
        })
      )
    },
    loadFromStorage() {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) 
        try {
          const state = JSON.parse(savedState)
          this.gridSize = state.gridSize || 8
          this.grid = state.grid || this.createEmptyGrid()
          this.score = state.score || 0
          this.itemsMerged = state.itemsMerged || 0
          this.noSpaceCount = state.noSpaceCount || 0
          this.gameOver = state.gameOver || false
          this.gameWon = state.gameWon || false
          this.store.gridSize = this.gridSize
          this.store.grid = this.grid
          this.store.score = this.score
        } catch (e) {
          console.error('Ошибка загрузки сохранения:', e)
          this.startNewGame()
        }else {
            this.startNewGame()
        }
    },
    checkGameConditions() {
      if (this.itemsMerged >= WIN_CONDITION) {
        this.gameWon = true
        this.gameOver = true
        return
      }
      if (this.noSpaceCount >= LOSE_CONDITION && !this.gameWon) {
        this.gameOver = true
        return
      }
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          if (this.grid[i]?.[j]?.level >= MAX_LEVEL) {
            this.gameWon = true
            this.gameOver = true
            return
          }
        }
      }
    },
    startNewGame() {
      this.grid = this.createEmptyGrid()
      this.score = 0
      this.itemsMerged = 0
      this.noSpaceCount = 0
      this.gameOver = false
      this.gameWon = false
      this.addMultipleRandomItems(5)
      this.saveToStorage()
      this.syncWithStore()
    },
    syncWithStore() {
      this.store.gridSize = this.gridSize
      this.store.grid = JSON.parse(JSON.stringify(this.grid))
      this.store.score = this.score
      this.store.saveGame()
    },
    loadFromStore() {
      this.gridSize = this.store.gridSize
      this.grid = this.store.grid ? JSON.parse(JSON.stringify(this.store.grid)) : this.createEmptyGrid()
      this.score = this.store.score || 0
    },
    createEmptyGrid() {
      const newGrid = []
      for (let i = 0; i < this.gridSize; i++) {
        const row = []
        for (let j = 0; j < this.gridSize; j++) {
          row.push(null)
        }
        newGrid.push(row)
      }
      return newGrid
    },
    newGame() {
      if (confirm('Начать новую игру?')) {
        this.startNewGame()
      }
    },
    addRandomItem() {
      if (this.gameOver) return
      const emptyCells = []
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          if (!this.grid[i]?.[j]) {
            emptyCells.push({ row: i, col: j })
          }
        }
      }
      if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        const level = Math.min(Math.floor(Math.random() * 3) + 1, MAX_LEVEL)
        const newGrid = JSON.parse(JSON.stringify(this.grid))
        newGrid[row][col] = { level }
        this.grid = newGrid
        this.noSpaceCount = 0
        this.checkGameConditions()
        this.saveToStorage()
        this.syncWithStore()
      } else {
        this.noSpaceCount++
        if (this.noSpaceCount >= LOSE_CONDITION && !this.gameWon) {
          this.gameOver = true
        }
        this.checkGameConditions()
        this.saveToStorage()
      }
    },
    addMultipleRandomItems(count) {
      if (this.gameOver) return
      const addNextItem = (remaining) => {
        if (remaining <= 0) {
            this.checkGameConditions()
            this.saveToStorage()
            this.syncWithStore()
            return
        }
        const emptyCells = []
        for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
            if (!this.grid[i]?.[j]) {
              emptyCells.push({ row: i, col: j })
            }
          }
        }
        if (emptyCells.length > 0) {
          const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
          const level = Math.min(Math.floor(Math.random() * 3) + 1, MAX_LEVEL) 
          const newGrid = JSON.parse(JSON.stringify(this.grid))
          newGrid[row][col] = { level }
          this.grid = newGrid
          setTimeout(() => addNextItem(remaining - 1), 10)
        } else {
          addNextItem(0)
        }
      }
      addNextItem(count)
    },
    addItemAfterMove() {
      if (this.gameOver) return
      const emptyCells = []
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          if (!this.grid[i]?.[j]) {
            emptyCells.push({ row: i, col: j })
          }
        }
      }
      if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        const level = Math.min(Math.floor(Math.random() * 3) + 1, MAX_LEVEL) 
        const newGrid = JSON.parse(JSON.stringify(this.grid))
        newGrid[row][col] = { level }
        this.grid = newGrid
        this.checkGameConditions()
        this.saveToStorage()
        this.syncWithStore()
      }
    },
    checkVictory() {
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          if (this.grid[i]?.[j]?.level >= MAX_LEVEL) {
            this.gameWon = true
            this.gameOver = true
            return true
          }
        }
      }
      return false
    },
    resetGame() {
      this.newGame()
    },
    changeGridSize(size) {
      if (this.gameOver) return
      this.gridSize = size
      const newGrid = this.createEmptyGrid()
      this.grid = newGrid
      this.score = 0
      this.itemsMerged = 0
      this.noSpaceCount = 0
      this.gameOver = false
      this.gameWon = false
      this.addMultipleRandomItems(5)
      this.checkGameConditions()
      this.saveToStorage()
      this.syncWithStore()
    },
    handleDragStart(data) {
      if (this.gameOver) return
      this.draggedItem = {
        row: data.row,
        col: data.col,
        level: data.cell.level
      }
    },
    handleDrop(data) {
      if (!this.draggedItem || this.gameOver) return
      const sourceRow = this.draggedItem.row
      const sourceCol = this.draggedItem.col
      const targetRow = data.row
      const targetCol = data.col
      if (sourceRow === targetRow && sourceCol === targetCol) {
        this.draggedItem = null
        return
      }
      const newGrid = JSON.parse(JSON.stringify(this.grid))
      const sourceItem = newGrid[sourceRow][sourceCol]
      const targetItem = newGrid[targetRow][targetCol]
      let moveHappened = false
      if (!targetItem) {
        newGrid[targetRow][targetCol] = JSON.parse(JSON.stringify(sourceItem))
        newGrid[sourceRow][sourceCol] = null
        moveHappened = true
      }
      else if (sourceItem.level === targetItem.level) {
        if (sourceItem.level < MAX_LEVEL) {
          const newLevel = sourceItem.level + 1
          const pointsEarned = Math.pow(newLevel, 2) * 10
          this.score += pointsEarned
          this.itemsMerged++
          newGrid[targetRow][targetCol] = { level: newLevel }
          newGrid[sourceRow][sourceCol] = null
          moveHappened = true
          if (newLevel >= MAX_LEVEL) {
            this.gameWon = true
            this.gameOver = true
          }
        }
      }
      else {
        const temp = JSON.parse(JSON.stringify(newGrid[sourceRow][sourceCol]))
        newGrid[sourceRow][sourceCol] = JSON.parse(JSON.stringify(newGrid[targetRow][targetCol]))
        newGrid[targetRow][targetCol] = temp
        moveHappened = true
      }
      this.grid = newGrid
      this.checkGameConditions()
      if (moveHappened && !this.gameOver) {
        this.addItemAfterMove()
      }
      this.draggedItem = null
      this.saveToStorage()
      this.syncWithStore()
    }
  }
}
</script>

<style lang="scss">
.game-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    position: relative;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 10px;
        background: #fffdfd;
        border-radius: 8px;
        flex-wrap: wrap;
        gap: 10px;
    }

    &__score {
        font-size: 24px;
        font-weight: bold;
        color: #000000;
    }

    &__controls {
        display: flex;
        gap: 10px;
    }

    &__button {
        padding: 10px 20px;
        background: #9d45cd;
        color: #000000;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;

        &:hover:not(:disabled) {
            background: darken(#9d45cd, 10%);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    &__size-controls {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
    }

    &__size-button {
        padding: 8px 16px;
        background: #9d45cd;
        color: #000000;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;

        &:hover:not(:disabled) {
            background: darken(#9d45cd, 10%);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    &__overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s;
    }

    &__message {
        background: #ffffff;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    &__title {
        font-size: 32px;
        margin-bottom: 20px;
        color: #333;
    }

    &__text {
        font-size: 24px;
        margin-bottom: 30px;
        color: #666;
    }

    &__play-again {
        padding: 15px 30px;
        font-size: 18px;
        background: #9d45cd;
        color: #000000;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
            background: darken(#9d45cd, 10%);
        }
    }

    &__progress {
        margin-top: 20px;
    }

    &__progress-bar {
        width: 100%;
        height: 20px;
        background: #f0f0f0;
        border-radius: 10px;
        overflow: hidden;
    }

    &__progress-fill {
        height: 100%;
        background: #9d45cd;
        transition: width 0.3s;
        border-radius: 10px;
    }

    &__progress-text {
        text-align: center;
        margin-top: 5px;
        color: #666;
        font-size: 14px;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>