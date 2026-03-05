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
        :disabled="isFull"
        @click="() => handleAddItem()"
      >
        Добавить предмет
      </button>
      <button
        class="game__button game__button--secondary"
        @click="() => handleReset()"
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
        @drop="(event) => onDrop(event, index)"
        @dragover.prevent="() => onDragOver(index)"
        @dragleave="() => onDragLeave()"
        @touchend="(event) => onTouchEnd(event, index)"
      >
        <div
          v-if="cell !== null"
          class="grid__item item"
          :class="[
            `item--level-${cell.level}`,
            { 'item--new': cell.isNew }
          ]"
          :draggable="true"
          @dragstart="(event) => onDragStart(event, index)"
          @dragend="(event) => onDragEnd(event)"
          @touchstart="(event) => onTouchStart(event, index)"
          @touchmove.prevent="(event) => onTouchMove(event)"
        >
          <span class="item__icon" :data-icon="getIconName(cell.level)"></span>
          <span class="item__level">{{ cell.level }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="message"
      class="game__message"
      :class="`game__message--${messageType}`"
    >
      {{ message }}
    </div>

    <div v-if="gameOver" class="game__overlay">
      <div class="game__game-over">
        <h2 class="game__game-over-title">Игра окончена!</h2>
        <p class="game__game-over-text">Нет свободных ячеек</p>
        <p class="game__game-over-score">Ваш счет: {{ score }}</p>
        <p class="game__game-over-moves">Сделано ходов: {{ moves }}</p>
        <button
          class="game__button game__button--large"
          @click="() => handleReset()"
        >
          Начать заново
        </button>
      </div>
    </div>
</div>
</template>

<script>
const STORAGE_KEY = 'puzzleGameState'
const INITIAL_ITEMS_COUNT = 7

export default {
  name: 'GameGrid',

  data() {
    return {
      draggedIndex: null,
      dragOverCell: null,
      touchStartIndex: null
    }
},

computed: {
    grid() {
      return this.$store.state.game.grid
    },

    score() {
      return this.$store.state.game.score
    },

    moves() {
      return this.$store.state.game.moves
    },

    gameOver() {
      return this.$store.state.game.gameOver
    },

    message() {
      return this.$store.state.game.message
    },

    messageType() {
      return this.$store.state.game.messageType
    },

    isFull() {
      return this.$store.getters['game/isFull']
    },

    emptyCells() {
      return this.$store.getters['game/emptyCells']
    },

    spawnProbabilities() {
      return this.$store.state.game.spawnProbabilities
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
      this.$store.commit('game/RESET_GAME')

      for (let i = 0; i < INITIAL_ITEMS_COUNT; i++) {
        this.addRandomItem(false, false)
      }

      this.saveGame()
    },

    addRandomItem(countAsMove = true, showAnimation = true) {
      const emptyCells = this.emptyCells

      if (emptyCells.length === 0) {
        if (countAsMove) {
          this.$store.commit('game/SET_GAME_OVER', true)
          this.showMessage('Игра окончена! Нет свободных ячеек!', 'error')
        }
        return false
      }

      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]

      const rand = Math.random()
      let randomLevel = 1
      let cumulativeProbability = 0

      for (const config of this.spawnProbabilities) {
        cumulativeProbability += config.probability
        if (rand < cumulativeProbability) {
          randomLevel = config.level
          break
        }
      }

      this.$store.commit('game/SET_CELL', {
        index: randomIndex,
        value: {
          level: randomLevel,
          isNew: showAnimation
        }
      })

      if (showAnimation) {
        setTimeout(() => {
          this.$store.commit('game/SET_CELL_NEW', {
            index: randomIndex,
            isNew: false
          })
        }, 500)
      }

      this.saveGame()
      return true
    },

    handleAddItem() {
      this.addRandomItem(true, true)
    },

    handleReset() {
      if (this.gameOver || confirm('Начать новую игру? Текущий прогресс будет потерян.')) {
        localStorage.removeItem(STORAGE_KEY)
        this.initGame()
        this.showMessage('Новая игра начата!', 'success')
      }
    },

    getIconName(level) {
      return this.$store.getters['game/getItemIcon'](level)
    },

    showMessage(text, type = 'info') {
      this.$store.commit('game/SET_MESSAGE', { text, type })

      setTimeout(() => {
        this.$store.commit('game/CLEAR_MESSAGE')
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

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
      } catch (e) {
        console.error('Ошибка сохранения игры:', e)
      }
    },

    loadGame() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)

        if (saved) {
          const gameState = JSON.parse(saved)

          this.$store.commit('game/SET_GRID', gameState.grid || [])
          this.$store.commit('game/SET_SCORE', gameState.score || 0)
          this.$store.commit('game/SET_MOVES', gameState.moves || 0)
          this.$store.commit('game/SET_GAME_OVER', gameState.gameOver || false)

          return true
        }

        return false
      } catch (e) {
        console.error('Ошибка загрузки игры:', e)
        return false
      }
    },

    mergeItems(fromIndex, toIndex) {
      const fromItem = this.$store.getters['game/getCell'](fromIndex)
      const toItem = this.$store.getters['game/getCell'](toIndex)

      if (toItem === null) {
        this.$store.commit('game/SET_CELL', { index: toIndex, value: fromItem })
        this.$store.commit('game/CLEAR_CELL', fromIndex)
        this.$store.commit('game/INCREMENT_MOVES')

        setTimeout(() => {
          const added = this.addRandomItem(false, true)
          if (added) {
            this.showMessage('Появился новый предмет!', 'success')
          }
        }, 300)

        this.saveGame()
        return true
      }

      if (fromItem.level === toItem.level) {
        const newLevel = toItem.level + 1

        this.$store.commit('game/SET_CELL', {
          index: toIndex,
          value: { level: newLevel, isNew: false }
        })
        this.$store.commit('game/CLEAR_CELL', fromIndex)

        const points = Math.pow(2, newLevel) * 10
        this.$store.commit('game/ADD_SCORE', points)
        this.$store.commit('game/INCREMENT_MOVES')

        this.showMessage(`+${points} очков! Уровень ${newLevel}!`, 'success')

        setTimeout(() => {
          const added = this.addRandomItem(false, true)
          if (added) {
            this.showMessage('Появился новый предмет!', 'success')
          }
        }, 300)

        this.saveGame()
        return true
      } else {
        this.showMessage('Можно объединять только одинаковые предметы!', 'warning')
        return false
      }
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
    }
}
}
</script>