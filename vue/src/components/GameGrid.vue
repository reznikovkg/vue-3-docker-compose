<template>
<div class="game">
    <div class="game__header">
      <div class="game__score">
        <span class="game__score-label">Очки:</span>
        <span class="game__score-value">{{ score }}</span>
      </div>
      <div class="game__moves">
        <span class="game__moves-label">Ходов:</span>
        <span class="game__moves-value">{{ moves }}</span>
      </div>
      <button 
        class="game__button"
        @click="addRandomItem"
        :disabled="isFull"
      >
        Добавить предмет
      </button>
      <button 
        class="game__button game__button--secondary"
        @click="resetGame"
      >
        Новая игра
      </button>
    </div>

    <div class="game__grid grid">
      <div
        v-for="(cell, index) in grid"
        :key="index"
        class="grid__cell"
        :class="{
          'grid__cell--occupied': cell !== null,
          'grid__cell--drag-over': dragOverCell === index,
          'grid__cell--new': cell && cell.isNew
        }"
        @drop="onDrop($event, index)"
        @dragover.prevent="onDragOver(index)"
        @dragleave="onDragLeave"
        @touchend="onTouchEnd($event, index)"
      >
        <div
          v-if="cell !== null"
          class="grid__item item"
          :class="[
            `item--level-${cell.level}`,
            { 'item--new': cell.isNew }
          ]"
          :draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragend="onDragEnd"
          @touchstart="onTouchStart($event, index)"
          @touchmove.prevent="onTouchMove"
        >
          <span class="item__icon">{{ getItemIcon(cell.level) }}</span>
          <span class="item__level">{{ cell.level }}</span>
        </div>
      </div>
    </div>

    <div v-if="message" class="game__message" :class="messageClass">
      {{ message }}
    </div>

    <div v-if="gameOver" class="game__overlay">
      <div class="game__game-over">
        <h2 class="game__game-over-title">Игра окончена!</h2>
        <p class="game__game-over-text">Нет свободных ячеек</p>
        <p class="game__game-over-score">Ваш счет: {{ score }}</p>
        <p class="game__game-over-moves">Сделано ходов: {{ moves }}</p>
        <button class="game__button game__button--large" @click="resetGame">
          Начать заново
        </button>
      </div>
    </div>
</div>
</template>

<script>
export default {
name: 'GameGrid',

data() {
    return {
      gridSize: 8,
      grid: [],
      score: 0,
      moves: 0,
      draggedIndex: null,
      dragOverCell: null,
      touchStartIndex: null,
      message: '',
      messageClass: '',
      messageTimeout: null,
      gameOver: false,
      itemIcons: ['🌱', '🌿', '🍀', '🌳', '🌲', '🏔️', '🌋', '⭐', '💎', '👑']
    }
},

computed: {
    isFull() {
      return this.grid.every(cell => cell !== null)
    }
},

mounted() {
    this.loadGame()
    if (this.grid.every(cell => cell === null)) {
      this.initGame()
    }
},

methods: {
    initGame() {
      this.grid = Array(this.gridSize * this.gridSize).fill(null)
      this.score = 0
      this.moves = 0
      this.gameOver = false
      
      for (let i = 0; i < 7; i++) {
        this.addRandomItem(false)
      }
      
      this.saveGame()
    },

    addRandomItem(countAsMove = true, showAnimation = true) {
      const emptyCells = this.grid
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null)

      if (emptyCells.length === 0) {
        if (countAsMove) {
          this.gameOver = true
          this.showMessage('Игра окончена! Нет свободных ячеек!', 'error')
        }
        return false
      }

      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      
      let randomLevel
      const rand = Math.random()
      if (rand < 0.60) {
        randomLevel = 1 
      } else if (rand < 0.85) {
        randomLevel = 2 
      } else {
        randomLevel = 3
      }

      this.grid[randomIndex] = {
        level: randomLevel,
        isNew: showAnimation
      }

      if (showAnimation) {
        setTimeout(() => {
          if (this.grid[randomIndex]) {
            this.grid[randomIndex].isNew = false
          }
        }, 500)
      }

      this.saveGame()
      return true
    },

    onDragStart(event, index) {
      this.draggedIndex = index
      event.dataTransfer.effectAllowed = 'move'
      event.target.classList.add('item--dragging')
    },

    onDragEnd(event) {
      event.target.classList.remove('item--dragging')
      this.draggedIndex = null
      this.dragOverCell = null
    },

    onDragOver(index) {
      this.dragOverCell = index
    },

    onDragLeave() {
      this.dragOverCell = null
    },

    onDrop(event, targetIndex) {
      event.preventDefault()
      this.dragOverCell = null

      if (this.draggedIndex === null || this.draggedIndex === targetIndex) {
        return
      }

      this.mergeItems(this.draggedIndex, targetIndex)
    },

    onTouchStart(event, index) {
      this.touchStartIndex = index
      event.target.classList.add('item--dragging')
    },

    onTouchMove(event) {
      if (this.touchStartIndex === null) return

      const touch = event.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      
      if (element && element.classList.contains('grid__cell')) {
        const cells = Array.from(document.querySelectorAll('.grid__cell'))
        const index = cells.indexOf(element)
        this.dragOverCell = index
      }
    },

    onTouchEnd(event, targetIndex) {
      if (this.touchStartIndex === null) return

      const draggedItem = document.querySelector('.item--dragging')
      if (draggedItem) {
        draggedItem.classList.remove('item--dragging')
      }

      if (this.touchStartIndex !== targetIndex) {
        this.mergeItems(this.touchStartIndex, targetIndex)
      }

      this.touchStartIndex = null
      this.dragOverCell = null
    },

    mergeItems(fromIndex, toIndex) {
      const fromItem = this.grid[fromIndex]
      const toItem = this.grid[toIndex]

      if (fromItem.level === toItem.level) {
        const newLevel = toItem.level + 1
        this.grid[toIndex] = { 
          level: newLevel,
          isNew: false
        }
        this.grid[fromIndex] = null

        const points = Math.pow(2, newLevel) * 10
        this.score += points
        this.moves++

        this.showMessage(`+${points} очков! Уровень ${newLevel}!`, 'success')
        
        setTimeout(() => {
          const added = this.addRandomItem(false, true)
          if (added) {
            this.showMessage('Появился новый предмет!', 'success')
          }
        }, 300)
        
        this.saveGame()
      } else {
        this.showMessage('Можно объединять только одинаковые предметы!', 'warning')
      }
    },

    getItemIcon(level) {
      return this.itemIcons[Math.min(level - 1, this.itemIcons.length - 1)]
    },

    showMessage(text, type = 'info') {
      this.message = text
      this.messageClass = `game__message--${type}`
      
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
      }

      this.messageTimeout = setTimeout(() => {
        this.message = ''
        this.messageClass = ''
      }, 2000)
    },

    saveGame() {
      const gameState = {
        grid: this.grid.map(cell => {
          if (cell === null) return null
          return { level: cell.level }
        }),
        score: this.score,
        moves: this.moves,
        gameOver: this.gameOver
      }
      localStorage.setItem('puzzleGameState', JSON.stringify(gameState))
    },

    loadGame() {
      const saved = localStorage.getItem('puzzleGameState')
      if (saved) {
        try {
          const gameState = JSON.parse(saved)
          this.grid = gameState.grid || Array(this.gridSize * this.gridSize).fill(null)
          this.score = gameState.score || 0
          this.moves = gameState.moves || 0
          this.gameOver = gameState.gameOver || false
        } catch (e) {
          console.error('Ошибка загрузки игры:', e)
          this.grid = Array(this.gridSize * this.gridSize).fill(null)
        }
      } else {
        this.grid = Array(this.gridSize * this.gridSize).fill(null)
      }
    },

    resetGame() {
      if (this.gameOver || confirm('Начать новую игру? Текущий прогресс будет потерян.')) {
        localStorage.removeItem('puzzleGameState')
        this.initGame()
        this.showMessage('Новая игра начата!', 'success')
      }
    }
}
}
</script>