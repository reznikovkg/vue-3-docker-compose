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
        @click="handleAddItem"
        :disabled="isFull"
      >
        Добавить предмет
      </button>
      <button 
        class="game__button game__button--secondary"
        @click="handleReset"
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

    <div v-if="message" class="game__message" :class="`game__message--${messageType}`">
      {{ message }}
    </div>

    <div v-if="gameOver" class="game__overlay">
      <div class="game__game-over">
        <h2 class="game__game-over-title">Игра окончена!</h2>
        <p class="game__game-over-text">Нет свободных ячеек</p>
        <p class="game__game-over-score">Ваш счет: {{ score }}</p>
        <p class="game__game-over-moves">Сделано ходов: {{ moves }}</p>
        <button class="game__button game__button--large" @click="handleReset">
          Начать заново
        </button>
      </div>
    </div>
</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

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
    ...mapState('game', [
      'grid',
      'score',
      'moves',
      'gameOver',
      'message',
      'messageType'
    ]),
    
    ...mapGetters('game', [
      'isFull',
      'getItemIcon'
    ])
},

mounted() {
    this.initializeGame()
},

methods: {
    ...mapActions('game', [
      'initGame',
      'loadGame',
      'addRandomItem',
      'mergeItems',
      'resetGame'
    ]),

    async initializeGame() {
      const loaded = await this.loadGame()
      
      if (!loaded || this.grid.every(cell => cell === null)) {
        this.initGame()
      }
    },
    handleAddItem() {
      this.addRandomItem({ countAsMove: true, showAnimation: true })
    },

    handleReset() {
      if (this.gameOver || confirm('Начать новую игру? Текущий прогресс будет потерян.')) {
        this.resetGame()
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

      this.mergeItems({
        fromIndex: this.draggedIndex,
        toIndex: targetIndex
      })
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
        this.mergeItems({
          fromIndex: this.touchStartIndex,
          toIndex: targetIndex
        })
      }

      this.touchStartIndex = null
      this.dragOverCell = null
    }
}
}
</script>