<template>
  <div class="c-game-page">
    <div class="c-game-page__header">
      <h1 class="c-game-page__title">Совмести пару</h1>
      <div class="c-game-page__score">
        Счёт: <span class="c-game-page__score-value">{{ score }}</span>
      </div>
    </div>

    <div class="c-game-page__controls">
      <button
        class="c-button"
        @click="addRandomItem"
      >
        Добавить букву
      </button>
      <button
        class="c-button c-button--red"
        @click="resetGame"
      >
        Новая игра
      </button>
    </div>

    <div
      class="c-game-page__grid"
      :style="gridStyle"
      @drop="handleGridDrop"
    >
      <GameCell
        v-for="(cell, index) in grid"
        :key="index"
        :item="cell"
        :index="index"
        :is-dragging="isDragging"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
        @drop="handleDrop"
        @touch-move="handleTouchMove"
        @touch-end="handleTouchEnd"
      />
    </div>

    <div class="c-game-page__legend">
      <h3 class="c-game-page__legend-title">Правила:</h3>
      <ul class="c-game-page__legend-list">
        <li>Перетаскивайте одинаковые буквы друг на друга</li>
        <li>При совмещении появляется буква следующего уровня</li>
        <li>Чем выше уровень, тем больше очков</li>
        <li>Уровни букв: A → B → C → D → E → F → G → H</li>
      </ul>
    </div>
  </div>
</template>

<script>
import GameCell from '../ui/GameCell.vue'

const GRID_SIZE = 8
const STORAGE_KEY = 'game-state'
const ITEM_TIERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const TIER_POINTS = [10, 25, 50, 100, 200, 400, 800, 1600]

export default {
  name: 'GamePage',

  components: {
    GameCell
  },

  data() {
    return {
      grid: [],
      score: 0,
      isDragging: false,
      draggedItem: null,
      draggedFromIndex: null,
      touchStartPosition: null,
      gridSize: GRID_SIZE
    }
  },

  computed: {
    gridStyle() {
      return {
        'grid-template-columns': `repeat(${this.gridSize}, 1fr)`
      }
    },
  },

  created() {
    this.loadGame()
  },

  methods: {
    loadGame() {
      const savedState = localStorage.getItem(STORAGE_KEY)

      if (savedState) {
        try {
          const { grid, score } = JSON.parse(savedState)
          this.grid = grid
          this.score = score
        } catch (e) {
          console.error('Ошибка загрузки сохранения:', e)
          this.initializeGrid()
        }
      } else {
        this.initializeGrid()
      }
    },

    saveGame() {
      const gameState = {
        grid: this.grid,
        score: this.score
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
    },

    initializeGrid() {
      this.grid = Array(this.gridSize * this.gridSize).fill(null)
      this.score = 0

      for (let i = 0; i < 8; i++) {
        this.addRandomItem()
      }

      this.saveGame()
    },

    resetGame() {
      if (confirm('Начать новую игру? Текущий прогресс будет потерян.')) {
        this.initializeGrid()
      }
    },

    addRandomItem() {
      if (this.isDragging) return

      const emptyCells = this.grid.reduce((acc, cell, index) => {
        if (cell === null) acc.push(index)
        return acc
      }, [])

      if (emptyCells.length === 0) {
        alert('Нет свободных клеток!')
        return
      }

      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const tier = Math.floor(Math.random() * 3) // Только базовые предметы (A, B, C)

      this.grid[randomIndex] = {
        tier,
        value: ITEM_TIERS[tier]
      }

      this.saveGame()
    },

    handleDragStart(item, index) {
      if (!item) return

      this.isDragging = true
      this.draggedItem = item
      this.draggedFromIndex = index
    },

    handleDragEnd() {
      this.isDragging = false
      this.draggedItem = null
      this.draggedFromIndex = null
      this.touchStartPosition = null
    },

    handleDrop(targetIndex) {
      if (!this.draggedItem || this.draggedFromIndex === targetIndex) {
        this.handleDragEnd()
        return
      }

      this.mergeItems(this.draggedFromIndex, targetIndex)
      this.handleDragEnd()
    },

    handleGridDrop() {
      this.handleDragEnd()
    },

    handleTouchMove(event, index) {
      if (!this.touchStartPosition) {
        this.touchStartPosition = {
          index,
          item: this.grid[index]
        }
      }
    },

    handleTouchEnd(event, targetIndex) {
      if (!this.touchStartPosition || !this.touchStartPosition.item) {
        this.touchStartPosition = null
        return
      }

      if (this.touchStartPosition.index !== targetIndex) {
        this.mergeItems(this.touchStartPosition.index, targetIndex)
      }

      this.touchStartPosition = null
    },

    mergeItems(fromIndex, toIndex) {
      const fromItem = this.grid[fromIndex]
      const toItem = this.grid[toIndex]

      if (!fromItem) return

      if (!toItem) {
        this.grid[toIndex] = { ...fromItem }
        this.grid[fromIndex] = null
        this.saveGame()
        return
      }

      if (fromItem.tier === toItem.tier) {
        const newTier = Math.min(fromItem.tier + 1, ITEM_TIERS.length - 1)

        this.score += TIER_POINTS[newTier]

        this.grid[toIndex] = {
          tier: newTier,
          value: ITEM_TIERS[newTier]
        }

        this.grid[fromIndex] = null

      } else {
        const temp = { ...fromItem }
        this.grid[fromIndex] = { ...toItem }
        this.grid[toIndex] = temp
      }

      this.saveGame()
    }
  }
}
</script>

<style lang="scss">
.c-game-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: #667eea;
    border-radius: 10px;
    color: white;
  }

  &__title {
    margin: 0;
    font-size: 24px;
  }

  &__score {
    font-size: 20px;
    font-weight: bold;

    &-value {
      color: #ffd700;
    }
  }

  &__controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;

    .c-button {
      flex: 1;
    }
  }

  &__grid {
    display: grid;
    gap: 4px;
    background: #f0f0f0;
    padding: 10px;
    border-radius: 10px;
    min-height: 400px;
  }

  &__legend {
    margin-top: 20px;
    padding: 15px;
    background: white;
    border-radius: 10px;

    &-title {
      margin: 0 0 10px 0;
      color: #333;
    }

    &-list {
      margin: 0;
      padding-left: 20px;
      color: #666;
      line-height: 1.6;
    }
  }
}
</style>