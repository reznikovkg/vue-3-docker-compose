<template>
<div class="c-game">
  <div class="c-game__container">
    <transition name="c-game__fade">
      <div v-if="getGameStatus === 'active'" class="c-game__field">
        <div
          v-for="(cell, index) in getGrid"
          :key="index"
          :class="[
            'c-game__cell',
            cell.t === 0 ? 'c-game__cell--empty' : 
            cell.t === 1 ? 'c-game__cell--tree' : 
            'c-game__cell--wall'
          ]"
        >
          <transition :name="`c-game__player-move-${getDirection}`">
            <div
              v-if="index === getPlayerIndex"
              class="c-game__player"
              :key="getPlayerIndex"
            >
              <slot name="player">🔥</slot>
            </div>
          </transition>
          <span v-if="cell.t === 1" class="c-game__emoji">
            <slot name="tree">🌲</slot>
          </span>
          <span v-else-if="cell.t === 2" class="c-game__emoji">
            <slot name="wall">⛰️</slot>
          </span>
        </div>
      </div>
    </transition>
    <aside class="c-game__stats">
      <div class="c-game__stat-item">
        <span class="c-game__stat-label">Время:</span>
        <StopWatch class="c-game__stopwatch" />
      </div>
      <div class="c-game__stat-item">
        <span class="c-game__stat-label">Деревья:</span>
        <span class="c-game__stat-value">{{ getTreeCount }}/{{ getTotalTrees }}</span>
      </div>
    </aside>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import StopWatch from '../StopWatch.vue'

const MOVEMENT_INTERVAL = 300
const CELL_SIZE = 60

export default {
  name: 'IndexPage',
  components: {
    StopWatch
  },
  props: {},
  emits: ['game-win', 'game-error'],
  data() {
    return {
      moveInterval: null,
      pendingDirection: null,
      victoryData: null
    }
  },
  computed: {
    ...mapGetters('game', [
      'getGrid',
      'getPlayerIndex',
      'getDirection',
      'getGameStatus',
      'getRows',
      'getCols',
      'getRemainingTrees',
      'getTreeCount',
      'getTotalTrees',
      'getCurrentTime'
    ]),
    isGameActive() {
      return this.getGameStatus === 'active'
    },
    shouldMove() {
      return this.isGameActive && this.pendingDirection
    },
    formattedVictoryTime() {
      if (!this.victoryData) return ''
      const minutes = Math.floor(this.victoryData.time / 60)
      const seconds = Math.floor(this.victoryData.time % 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    cellSize() {
      return CELL_SIZE
    }
  },
  mounted() {
    this.initGame()
    window.addEventListener('keydown', this.handleKeyDown)
    this.startMovement()
  },
  beforeUnmount() {
    this.stopMovement()
    window.removeEventListener('keydown', this.handleKeyDown)
    this.stopTimer()
    this.setGameStatus('paused')
  },
  methods: {
    ...mapActions('game', [
      'setPlayerIndex',
      'setDirection',
      'setLastKey',
      'setGameStatus',
      'collectTree',
      'resetGame',
      'startTimer',
      'stopTimer'
    ]),
    initGame() {
      return this.resetGame()
        .then(() => this.setGameStatus('active'))
        .then(() => {
          this.startMovement()
        })
        .catch((error) => {
          console.error('Game initialization error:', error)
          this.$emit('game-error', error)
        })
    },
    startMovement() {
      if (this.moveInterval) return
      this.moveInterval = setInterval(() => this.movePlayer(), MOVEMENT_INTERVAL)
    },
    stopMovement() {
      if (this.moveInterval) {
        clearInterval(this.moveInterval)
        this.moveInterval = null
      }
    },
    movePlayer() {
      if (!this.isGameActive) return
      const currentDirection = this.pendingDirection || this.getDirection
      if (!currentDirection) return
      const nextIndex = this.getNextIndex(this.getPlayerIndex, currentDirection)
      if (nextIndex === this.getPlayerIndex || this.getGrid[nextIndex].t === 2) {
        this.pendingDirection = null
        return
      }
      this.setPlayerIndex(nextIndex)
      if (this.getGrid[nextIndex].t === 1) {
        this.collectTree(nextIndex).then(() => this.checkVictory())
      }
      if (this.pendingDirection) {
        this.setDirection(this.pendingDirection)
        this.pendingDirection = null
      }
    },
    showVictoryAlert() {
      if (!this.victoryData) return
      const alertMessage = ` ПОБЕДА! \n\n` +
        `Собрано деревьев: ${this.victoryData.trees}\n` +
        `Время: ${this.formattedVictoryTime}\n\n` +
        `Игра начнется заново...`
      setTimeout(() => {
        alert(alertMessage)
      }, 100)
    },
    checkVictory() {
      if (this.getRemainingTrees === 0) {
        this.victoryData = {
          trees: this.getTreeCount,
          time: this.getCurrentTime
        }
        this.$emit('game-win', this.victoryData)
        this.showVictoryAlert()
        this.stopMovement()
        this.setGameStatus('win')
          .then(() => this.resetGame())
          .then(() => this.setGameStatus('active'))
          .then(() => {
            this.startMovement()
            this.victoryData = null
          })
          .catch((error) => {
            console.error('Game restart error:', error)
            this.$emit('game-error', error)
          })
      }
    },
    restartGame() {
      this.stopMovement()
      return this.initGame()
    },
    getNextIndex(currentIndex, moveDirection) {
      const row = Math.floor(currentIndex / this.getCols)
      const col = currentIndex % this.getCols
      let nextRow = row
      let nextCol = col
      const moves = {
        'up': [-1, 0],
        'down': [1, 0],
        'left': [0, -1],
        'right': [0, 1]
      }
      const [dRow, dCol] = moves[moveDirection] || [0, 0]
      nextRow += dRow
      nextCol += dCol
      if (nextRow < 0 || nextRow >= this.getRows || nextCol < 0 || nextCol >= this.getCols) {
        return currentIndex
      }
      return nextRow * this.getCols + nextCol
    },
    handleKeyDown(event) {
      if (!this.isGameActive) return
      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      }
      const newDirection = keyMap[event.key]
      if (!newDirection) return
      event.preventDefault()
      this.setLastKey(newDirection)
      if (this.pendingDirection !== newDirection) {
        this.pendingDirection = newDirection
        this.setDirection(newDirection)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.c-game {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #485248;
  &__container {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  &__field {
    display: grid;
    grid-template-columns: repeat(v-bind('getCols'), v-bind('cellSize + "px"'));
    grid-template-rows: repeat(v-bind('getRows'), v-bind('cellSize + "px"'));
    gap: 2px;
    background-color: #055913;
    padding: 4px;
    border-radius: 8px;
  }
  &__stats {
    background-color: #004129;
    padding: 20px;
    border-radius: 8px;
    min-width: 200px;
    color: white;
  }
  &__stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 18px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &__stat-label {
    font-weight: bold;
    color: #ffffff;
  }
  &__stat-value {
    font-family: monospace;
    font-size: 24px;
    color: #ffffff;
  }
  &__cell {
    width: v-bind('cellSize + "px"');
    height: v-bind('cellSize + "px"');
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 4px;
    &--wall {
      background-color: #8B7355;
    }
    &--tree {
      background-color: #90EE90;
    }
    &--empty {
      background-color: #464646;
    }
  }
  &__player {
    font-size: 40px;
    line-height: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
  }
  &__fade-enter-active,
  &__fade-leave-active {
    transition: opacity 0.3s ease;
  }
  &__fade-enter-from,
  &__fade-leave-to {
    opacity: 0;
  }
  &__player-move-up-enter-active {
    transition: all 0.2s ease-out;
  }
  &__player-move-up-leave-active {
    transition: all 0.2s ease-in;
    position: absolute;
  }
  &__player-move-up-enter-from {
    opacity: 0;
    transform: translate(-50%, 100%) scale(0.8);
  }
  &__player-move-up-enter-to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  &__player-move-up-leave-to {
    opacity: 0;
    transform: translate(-50%, -200%) scale(0.8);
  }
  &__player-move-down-enter-active {
    transition: all 0.2s ease-out;
  }
  &__player-move-down-leave-active {
    transition: all 0.2s ease-in;
    position: absolute;
  }
  &__player-move-down-enter-from {
    opacity: 0;
    transform: translate(-50%, -200%) scale(0.8);
  }
  &__player-move-down-enter-to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  &__player-move-down-leave-to {
    opacity: 0;
    transform: translate(-50%, 100%) scale(0.8);
  }
  &__player-move-left-enter-active {
    transition: all 0.2s ease-out;
  }
  &__player-move-left-leave-active {
    transition: all 0.2s ease-in;
    position: absolute;
  }
  &__player-move-left-enter-from {
    opacity: 0;
    transform: translate(100%, -50%) scale(0.8);
  }
  &__player-move-left-enter-to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  &__player-move-left-leave-to {
    opacity: 0;
    transform: translate(-200%, -50%) scale(0.8);
  }
  &__player-move-right-enter-active {
    transition: all 0.2s ease-out;
  }
  &__player-move-right-leave-active {
    transition: all 0.2s ease-in;
    position: absolute;
  }
  &__player-move-right-enter-from {
    opacity: 0;
    transform: translate(-200%, -50%) scale(0.8);
  }
  &__player-move-right-enter-to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  &__player-move-right-leave-to {
    opacity: 0;
    transform: translate(100%, -50%) scale(0.8);
  }
  &__emoji {
    font-size: 40px;
    line-height: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
}
</style>