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
            <transition name="c-game__fade">
              <div v-if="index === getPlayerIndex" class="c-game__player">
                <Element type="player" />
              </div>
            </transition>
            <MovingElement
              v-if="getCloud && index === getCloud.index && getGameStatus === 'active'"
              :element-data="getCloud"
              class="c-game__cloud"
            />
            <template v-for="spark in getSparks" :key="spark.id">
              <MovingElement
                v-if="index === spark.index"
                :element-data="spark"
              />
            </template>
            <Element
              v-if="cell.t === 1"
              type="tree"
              class="c-game__emoji"
            />
            <Element
              v-else-if="cell.t === 2"
              type="wall"
              class="c-game__emoji"
            />
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
import Element from '../Element.vue'
import { mapGetters, mapActions } from 'vuex'
import StopWatch from '../StopWatch.vue'
import MovingElement from '../MovingElement.vue'

const MOVEMENT_INTERVAL = 300
const CELL_SIZE = 60
const SPARK_COOLDOWN_MS = 100

export default {
  name: 'IndexPage',
  components: {
    StopWatch,
    MovingElement,
    Element
  },
  props: {},
  emits: ['game-win', 'game-lose', 'game-error'],
  data() {
    return {
      moveInterval: null,
      pendingDirection: null,
      victoryData: null,
      cloudMoveInterval: null,
      sparkInterval: null
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
      'getCurrentTime',
      'getCloud', 
      'getCloudIndex',
      'getCloudDirection',
      'isGameOver',
      'getSparks',
      'getLastShotTime'
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
    },
  },
  mounted() {
    this.initGame()
    window.addEventListener('keydown', this.handleKeyDown)
    this.startMovement()
    this.startCloudMovement()
    this.startSparkMovement()
  },
  beforeUnmount() {
    this.stopMovement()
    this.stopCloudMovement()
    this.stopSparkMovement()
    window.removeEventListener('keydown', this.handleKeyDown) 
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
      'setGameOver',
      'initCloud',
      'moveCloud',
      'addSpark',        
      'moveAllSparks',   
      'setLastShotTime'
    ]),
    initGame() {
      return this.resetGame()
        .then(() => this.setGameStatus('active'))
        .then(() => {
          this.startMovement()
          this.startCloudMovement()
          this.startSparkMovement()
          this.initCloud()
        })
    },
    startMovement() {
      if (this.moveInterval) return
      this.moveInterval = setInterval(() => this.movePlayer(), MOVEMENT_INTERVAL)
    },
    stopMovement() {
      if (this.moveInterval) {
        clearInterval(this.moveInterval)
        this.stopCloudMovement()
        this.stopSparkMovement()
        this.moveInterval = null
      }
    },
    startCloudMovement() {
      if (this.cloudMoveInterval) return
      this.cloudMoveInterval = setInterval(() => {
        this.moveCloud().then(() => {
          if (this.isGameOver || this.getCloudIndex === this.getPlayerIndex) {
            this.handleGameOver()
          }
        })
      }, MOVEMENT_INTERVAL * 2)
    },
    stopCloudMovement() {
      if (this.cloudMoveInterval) {
        clearInterval(this.cloudMoveInterval)
        this.cloudMoveInterval = null
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
      if (nextIndex === this.getCloudIndex) {
        this.setGameOver(true)
        this.handleGameOver()
        return
      }
      if (this.getGrid[nextIndex].t === 1) {
        this.collectTree(nextIndex).then(() => this.checkVictory())
      }
      if (this.pendingDirection) {
        this.setDirection(this.pendingDirection)
        this.pendingDirection = null
      }
       if (this.isGameOver) {
        this.handleGameOver()
        return
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
        this.stopSparkMovement()
        this.setGameStatus('win')
          .then(() => this.resetGame())
          .then(() => this.setGameStatus('active'))
          .then(() => {
            this.startMovement()
            this.startCloudMovement()
            this.startSparkMovement()
            this.initCloud()
            this.victoryData = null
          })
      }
    },
    handleGameOver() {
      const alertMessage = 'Вы проиграли, попробуйте снова'
      setTimeout(() => {
        alert(alertMessage)
      }, 100)
      this.$emit('game-lose')
      this.stopMovement()
      this.stopCloudMovement()
      this.stopSparkMovement()
      this.setGameStatus('lose')
        .then(() => this.resetGame())
        .then(() => this.setGameStatus('active'))
        .then(() => {
          this.startMovement()
          this.startCloudMovement()
          this.startSparkMovement()
          this.initCloud()
        })
    },
    handleShoot() {
      if (!this.isGameActive) return
      const currentTime = Date.now()
      const lastShotTime = this.getLastShotTime
      if (currentTime - lastShotTime < SPARK_COOLDOWN_MS) {
        return
      }
      const currentDirection = this.pendingDirection || this.getDirection
      if (!currentDirection) return
      this.addSpark({
        index: this.getPlayerIndex,
        direction: currentDirection
      })
    },
    startSparkMovement() {
      if (this.sparkInterval) return
      this.sparkInterval = setInterval(() => {
        this.moveAllSparks()
      }, MOVEMENT_INTERVAL / 2)
    },
    stopSparkMovement() {
      if (this.sparkInterval) {
        clearInterval(this.sparkInterval)
        this.sparkInterval = null
      }
    },
    restartGame() {
      this.stopMovement()
      this.stopCloudMovement()
      this.stopSparkMovement()
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
      if (event.code === 'Space') {
        event.preventDefault()
        this.handleShoot()
        return
      }
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
    transition: opacity 0.2s ease;
  }
  &__fade-enter-from,
  &__fade-leave-to {
    opacity: 0;
  }
}
</style>