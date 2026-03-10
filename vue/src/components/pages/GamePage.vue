<template>
  <div class="game-page">
    <div class="game-page__header">
      <div class="game-page__score">
        Очки: {{ score }}
      </div>
      <div class="game-page__controls">
        <button
            class="button button--primary"
            :disabled="score < buyCost"
            @click="() => buyItem()"
        >
            Купить элемент ({{ buyCost }} очков)
        </button>
        <button
            class="button button--primary"
            @click="() => resetGame()"
        >
            Новая игра
        </button>
    </div>
</div>

    <GameGrid
      :grid="grid"
      :grid-size="gridSize"
      :dragged-item="draggedItem"
      :max-level="MAX_LEVEL"                                         
      :cell-emoji="getCellImage"                     
      @drag-start="(data) => handleDragStart(data)"
      @drop="(data) => handleDrop(data)"
      @spawn-from-max="(index) => spawnFromMax(index)"
      @sell="(data) => sellItem(data)"
    />

    <div class="game-page__size-controls">
      <button 
        v-for="size in [8, 10, 12]" 
        :key="size"
        class="button button--size"
        @click="() => changeGridSize(size)"
      >
        {{ size }}x{{ size }}
      </button>
    </div>
   </div>
</template>

<script>
import GameGrid from '../ui/GameGrid.vue'
const MAX_LEVEL = 4
const STORAGE_KEY = 'pair-game-save'
const INITIAL_SCORE = 100
const BUY_COST = 10

const BRANCHES = {
  spring: {
    name: 'Весна',
    color: '#e74c3c',
    levels: [
      '/images/s1.jpg',
      '/images/s2.jpg',
      '/images/s3.jpg',
      '/images/s4.jpg',
      '/images/s5.jpg'
    ]
  },
  fruits: {
    name: 'Фрукты',
    color: '#3498db',
    levels: [
      '/images/1.jpg',
      '/images/2.jpg',
      '/images/3.jpg',
      '/images/4.jpg',
      '/images/5.jpg'
    ]
  }
}

export default {
  name: 'GamePage',
  components: {
    GameGrid
  },
  data() {
    return {
      gridSize: 8,
      grid: [],
      score: INITIAL_SCORE,
      draggedItem: null,
      itemsMerged: 0,
      noSpaceCount: 0,
      buyCost: BUY_COST,
      MAX_LEVEL
    }
  },
  mounted () {
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
          noSpaceCount: this.noSpaceCount
        })
      )
    },
    getCellImage (branch, level) {
      return BRANCHES[branch]?.levels[level] ?? '?'
    },
    buyItem () {
      if (this.score < this.buyCost) return
      const emptyIndices = []
      this.grid.forEach((cell, index) => {
        if (!cell) emptyIndices.push(index)
      })
      if (!emptyIndices.length) {
        this.noSpaceCount++
        this.saveToStorage()
        return
      }
      this.score -= this.buyCost
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
      const branch = this.getRandomBranch()
      const newGrid = [...this.grid]
      newGrid[randomIndex] = { branch, level: 0 }
      this.grid = newGrid
      this.noSpaceCount = 0
      this.saveToStorage()
    },
    getRandomBranch () {
      const keys = Object.keys(BRANCHES)
      return keys[Math.floor(Math.random() * keys.length)]
    },
    spawnFromMax (index) {
      const cell = this.grid[index]
      if (!cell || cell.level < MAX_LEVEL) return
      if (this.score < 5) return
      const emptyIndices = []
      this.grid.forEach((c, i) => {
        if (!c) emptyIndices.push(i)
      })
      if (!emptyIndices.length) return
      this.score -= 5
      const newIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
      const newGrid = [...this.grid]
      newGrid[newIndex] = { branch: cell.branch, level: 0 }
      this.grid = newGrid
      this.saveToStorage()
    },
    sellItem (data) {
        const cell = this.grid[data.index]
        if (!cell) return
        const sellPrice = (cell.level + 1) * 10
        this.score += sellPrice
        const newGrid = [...this.grid]
        newGrid[data.index] = null
        this.grid = newGrid
        this.saveToStorage()
    },
    loadFromStorage() {
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (savedState){
            try {
                const state = JSON.parse(savedState)
                this.gridSize = state.gridSize || 8
                this.grid = state.grid || this.createEmptyGrid()
                this.score = state.score || INITIAL_SCORE
                this.itemsMerged = state.itemsMerged || 0
                this.noSpaceCount = state.noSpaceCount || 0
            } catch (e) {
                console.error('Ошибка загрузки сохранения:', e)
                this.startNewGame()
            }
        }else {
            this.startNewGame()
        }
    },
    startNewGame() {
      this.grid = this.createEmptyGrid()
      this.score = INITIAL_SCORE
      this.itemsMerged = 0
      this.noSpaceCount = 0
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
        const emptyIndices = []
        this.grid.forEach((cell, index) => {
            if (!cell) {
                emptyIndices.push(index)
            }
        })
        if (emptyIndices.length === 0) {
            this.noSpaceCount++
            this.saveToStorage()
            return
        }
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        const branch = this.getRandomBranch()        
        this.grid[randomIndex] = { branch, level: 0 }
        this.noSpaceCount = 0
        this.saveToStorage()
    },
    addMultipleRandomItems(count) {
      const addNextItem = (remaining) => {
        if (remaining <= 0) {
            this.saveToStorage()
            return
        }
        const emptyIndices = []
        this.grid.forEach((cell, index) => {
            if (!cell) emptyIndices.push(index)
        })
        if (emptyIndices.length > 0) {
            const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
            const branch = this.getRandomBranch()
            const newGrid = [...this.grid]
            newGrid[randomIndex] = { branch, level: 0 }
            this.grid = newGrid
            setTimeout(() => addNextItem(remaining - 1), 10)
        } else {
            addNextItem(0)
        }
      }
      addNextItem(count)
    },
    resetGame() {
      this.newGame()
    },
    changeGridSize(size) {
      this.gridSize = size
      const newGrid = this.createEmptyGrid()
      this.grid = newGrid
      this.score = INITIAL_SCORE
      this.itemsMerged = 0
      this.noSpaceCount = 0
      this.addMultipleRandomItems(5)
      this.saveToStorage()
    },
    handleDragStart(data) {
      this.draggedItem = {
        index: data.index,      
        level: data.cell.level,
        branch: data.cell.branch 
        }
    },
    handleDrop(data) {
        if (!this.draggedItem) return
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
        }else if (
        sourceItem.level === targetItem.level &&
        sourceItem.branch === targetItem.branch    
        ) {
        if (sourceItem.level < MAX_LEVEL) {
                const newLevel = sourceItem.level + 1
                const pointsEarned = newLevel
                this.score += pointsEarned
                this.itemsMerged++
                newGrid[targetIndex] = { branch: sourceItem.branch, level: newLevel }
                newGrid[sourceIndex] = null
                moveHappened = true
            }
        }
        else {
            const temp = { ...newGrid[sourceIndex] }
            newGrid[sourceIndex] = { ...newGrid[targetIndex] }
            newGrid[targetIndex] = temp
            moveHappened = true
        }
        this.grid = newGrid
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
}

</style>