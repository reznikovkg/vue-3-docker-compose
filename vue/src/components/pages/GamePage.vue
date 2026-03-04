<template>
  <div class="game-page">
    <div class="game-page__header">
      <div class="game-page__score">
        Очки: {{ score }}
      </div>
      <div class="game-page__controls">
        <button
            class="button button--primary"
            @click="() => addRandomItem()"
            :disabled="gameOver"
        >
            Добавить предмет
        </button>
        <button
            class="button button--primary"
            @click="() => resetGame()"
        >
            Новая игра
        </button>
    </div>
</div>

     <div
      v-if="gameOver"
      class="game-page__overlay"
      @click="() => resetGame()"
    >
      <div class="game-page__message">
        <h2 class="game-page__title">
          {{ gameOverMessage }}
        </h2>
        <p class="game-page__text">
          Ваш счет: {{ score }}
        </p>
        <button
          class="button button--play-again"
          @click="() => resetGame()"
        >
          Играть снова
        </button>
      </div>
    </div>

    <GameGrid
      :grid="grid"
      :grid-size="gridSize"
      :dragged-item="draggedItem"
      :game-over="gameOver"
      @drag-start="(data) => handleDragStart(data)"
      @drop="(data) => handleDrop(data)"
    />

    <div class="game-page__size-controls">
      <button 
        v-for="size in [8, 10, 12]" 
        :key="size"
        class="button button--size"
        @click="() => changeGridSize(size)"
        :disabled="gameOver"
      >
        {{ size }}x{{ size }}
      </button>
    </div>

    <div class="game-page__progress">
      <div class="game-page__progress-bar">
        <div
          class="game-page__progress-fill"
          :style="{ width: progressPercentage + '%' }"
        />
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
        if (savedState){
            try {
                const state = JSON.parse(savedState)
                this.gridSize = state.gridSize || 8
                this.grid = state.grid || this.createEmptyGrid()
                this.score = state.score || 0
                this.itemsMerged = state.itemsMerged || 0
                this.noSpaceCount = state.noSpaceCount || 0
                this.gameOver = state.gameOver || false
                this.gameWon = state.gameWon || false
            } catch (e) {
                console.error('Ошибка загрузки сохранения:', e)
                this.startNewGame()
            }
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
      const hasMaxLevel = this.grid.some(cell => cell?.level >= MAX_LEVEL)
      if (hasMaxLevel) {
        this.gameWon = true
        this.gameOver = true
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
    },
    createEmptyGrid() {
      const totalCells = this.gridSize * this.gridSize
      return Array(totalCells).fill(null)
    },
    newGame() {
      if (confirm('Начать новую игру?')) {
        this.startNewGame()
      }
    },
    addRandomItem() {
        if (this.gameOver) return
        const emptyIndices = []
        this.grid.forEach((cell, index) => {
            if (!cell) {
                emptyIndices.push(index)
            }
        })
        if (emptyIndices.length === 0) {
            this.noSpaceCount++
            if (this.noSpaceCount >= LOSE_CONDITION && !this.gameWon) {
                this.gameOver = true
            }
            this.checkGameConditions()
            this.saveToStorage()
            return
        }
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        const level = Math.floor(Math.random() * 3) + 1
        this.grid[randomIndex] = { level: Math.min(level, MAX_LEVEL) }
        this.noSpaceCount = 0
        this.checkGameConditions()
        this.saveToStorage()
    },
    addMultipleRandomItems(count) {
      if (this.gameOver) return
      const addNextItem = (remaining) => {
        if (remaining <= 0) {
            this.checkGameConditions()
            this.saveToStorage()
            return
        }
        const emptyIndices = []
        this.grid.forEach((cell, index) => {
            if (!cell) emptyIndices.push(index)
        })
        if (emptyIndices.length > 0) {
            const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
            const level = Math.min(Math.floor(Math.random() * 3) + 1, MAX_LEVEL)
            const newGrid = [...this.grid]
            newGrid[randomIndex] = { level }
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
        const emptyIndices = []
        this.grid.forEach((cell, index) => {
        if (!cell) emptyIndices.push(index)
    })
    if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        const level = Math.min(Math.floor(Math.random() * 3) + 1, MAX_LEVEL)
        const newGrid = [...this.grid]
        newGrid[randomIndex] = { level }
        this.grid = newGrid
        this.checkGameConditions()
        this.saveToStorage()
    }
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
    },
    handleDragStart(data) {
      if (this.gameOver) return
      this.draggedItem = {
        index: data.index,      
        level: data.cell.level
        }
    },
    handleDrop(data) {
        if (!this.draggedItem || this.gameOver) return
        const sourceIndex = this.draggedItem.index            
        const targetIndex = data.index
        if (sourceIndex === targetIndex) {
            this.draggedItem = null
            return
        }
        const newGrid = [...this.grid]
        const sourceItem = newGrid[sourceIndex]
        const targetItem = newGrid[targetIndex]
        let moveHappened = false
        if (!targetItem) {
            newGrid[targetIndex] = { ...sourceItem }
            newGrid[sourceIndex] = null
            moveHappened = true
        }
        else if (sourceItem.level === targetItem.level) {
            if (sourceItem.level < MAX_LEVEL) {
                const newLevel = sourceItem.level + 1
                const pointsEarned = Math.pow(newLevel, 2) * 10
                this.score += pointsEarned
                this.itemsMerged++
                newGrid[targetIndex] = { level: newLevel }
                newGrid[sourceIndex] = null
                moveHappened = true
                if (newLevel >= MAX_LEVEL) {
                        this.gameWon = true
                        this.gameOver = true
                }
            }
        }
        else {
            const temp = { ...newGrid[sourceIndex] }
            newGrid[sourceIndex] = { ...newGrid[targetIndex] }
            newGrid[targetIndex] = temp
            moveHappened = true
        }
        this.grid = newGrid
        this.checkGameConditions()
        if (moveHappened && !this.gameOver) {
            this.addItemAfterMove()
        }
        this.draggedItem = null
        this.saveToStorage()
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

  &__size-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
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

.button {
  padding: 10px 20px;
  background: #9d45cd;
  color: #000000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;

  &:hover:not(:disabled) {
    background: darken(#9d45cd, 10%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--size {
    padding: 8px 16px;
  }

  &--play-again {
    padding: 15px 30px;
    font-size: 18px;
  }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>