<template>
  <div class="puzzle">
    <div class="puzzle__content">
      <h2 class="puzzle__title">Пятнашки {{ gridSize }}×{{ gridSize }}</h2>

      <div v-if="isWin" class="puzzle__win">ПОБЕДА!</div>

      <div class="puzzle__stats">
        <div class="puzzle__stat">
          <span class="puzzle__stat-label">Ходы:</span>
          <span class="puzzle__stat-value">{{ moves }}</span>
        </div>

        <div class="puzzle__stat">
          <span class="puzzle__stat-label">Время:</span>
          <span class="puzzle__stat-value">{{ formatTime(timer) }}</span>
        </div>

        <div class="puzzle__stat" v-if="recordTime">
          <span class="puzzle__stat-label">Рекорд:</span>
          <span class="puzzle__stat-value puzzle__stat-value--record">{{ formatTime(recordTime) }}</span>
        </div>

        <div class="puzzle__stat puzzle__stat--special" v-if="specialMoves > 0">
          <span class="puzzle__stat-label">Спец-ходы:</span>
          <span class="puzzle__stat-value puzzle__stat-value--special">{{ specialMoves }}</span>
        </div>
      </div>

      <div class="puzzle__board" :style="boardStyle">
        <PuzzleTile
            v-for="tile in tileList"
            :key="tile.index"
            :value="tile.value"
            :is-empty="tile.isEmpty"
            :is-win="isWin"
            :is-blocked="tile.isBlocked"
            :tile-style="tileStyle"
            :allow-any-move="specialMoves > 0"
            @click="() => handleTileClick(tile.index)"
        />
      </div>

      <div class="puzzle__controls">
        <button
            class="puzzle__button"
            @click="() => changeSize(-1)"
            :disabled="gridSize <= 3"
        >
          −
        </button>

        <button
            class="puzzle__restart"
            @click="() => initGame()"
        >
          Перемешать
        </button>

        <button
            class="puzzle__button"
            @click="() => changeSize(1)"
        >
          +
        </button>
      </div>

      <div v-if="specialMoves > 0" class="puzzle__hint">
        💥 Спец-ход доступен! Кликните на любую плитку
      </div>
    </div>
  </div>
</template>

<script>
import PuzzleTile from './PuzzleTile.vue'

export default {
  name: 'IndexPage',
  components: {
    PuzzleTile,
  },
  data() {
    return {
      gridSize: 4,
      minGridSize: 3,
      tiles: [],
      moves: 0,
      timer: 0,
      timerInterval: null,
      specialMoves: 0,
      specialMoveInterval: null,
      blockedIndex: null,
      records: {},
    }
  },
  computed: {
    isWin() {
      return this.checkWin()
    },

    tileList() {
      return this.tiles.map((value, index) => {
        return {
          index: index,
          value: value,
          isEmpty: value === 0,
          isBlocked: index === this.blockedIndex,
        }
      })
    },

    boardStyle() {
      return {
        'grid-template-columns': `repeat(${this.gridSize}, 1fr)`,
        'grid-template-rows': `repeat(${this.gridSize}, 1fr)`,
      }
    },

    tileStyle() {
      const baseSize = 80
      const minTileSize = 25
      const size = Math.max(minTileSize, baseSize - (this.gridSize - 4) * 5)
      const fontSize = Math.max(10, 28 - (this.gridSize - 4) * 2)

      return {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${fontSize}px`,
      }
    },

    recordTime() {
      const key = `${this.gridSize}x${this.gridSize}`
      return this.records[key] || null
    },
  },
  methods: {
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },

    loadRecords() {
      const saved = localStorage.getItem('puzzleRecords')
      if (saved) {
        this.records = JSON.parse(saved)
      }
    },

    saveRecord() {
      const key = `${this.gridSize}x${this.gridSize}`
      const currentRecord = this.records[key]

      if (!currentRecord || this.timer < currentRecord) {
        this.records[key] = this.timer
        localStorage.setItem('puzzleRecords', JSON.stringify(this.records))
      }
    },

    blockRandomMove() {
      const emptyIndex = this.tiles.indexOf(0)
      const neighbors = this.getNeighbors(emptyIndex)

      if (neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * neighbors.length)
        this.blockedIndex = neighbors[randomIndex]
      } else {
        this.blockedIndex = null
      }
    },

    clearBlockedMove() {
      this.blockedIndex = null
    },

    checkWin() {
      const total = this.gridSize * this.gridSize

      for (let i = 0; i < total; i++) {
        const expectedValue = (i < total - 1) ? (i + 1) : 0

        if (this.tiles[i] !== expectedValue) {
          return false
        }
      }

      return true
    },

    changeSize(delta) {
      const newSize = this.gridSize + delta

      if (newSize >= this.minGridSize) {
        this.gridSize = newSize
        this.initGame()
      }
    },

    initGame() {
      this.stopTimer()
      this.stopSpecialMoveTimer()

      this.moves = 0
      this.timer = 0
      this.specialMoves = 0
      this.blockedIndex = null

      const total = this.gridSize * this.gridSize

      this.tiles = Array.from(
          { length: total },
          (_, i) => {
            return (i + 1) % total
          }
      )

      this.shuffleBoard()
      this.loadRecords()
      this.startTimer()
      this.startSpecialMoveTimer()
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        this.timer++
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    startSpecialMoveTimer() {
      this.specialMoveInterval = setInterval(() => {
        this.specialMoves++
      }, 60000)
    },

    stopSpecialMoveTimer() {
      if (this.specialMoveInterval) {
        clearInterval(this.specialMoveInterval)
        this.specialMoveInterval = null
      }
    },

    shuffleBoard() {
      let previousIndex = -1
      const shuffleMoves = this.gridSize * this.gridSize * 10

      for (let i = 0; i < shuffleMoves; i++) {
        const emptyIndex = this.tiles.indexOf(0)
        const neighbors = this.getNeighbors(emptyIndex)
        const validNeighbors = neighbors.filter((n) => {
          return n !== previousIndex
        })
        const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)]

        this.swapTiles(emptyIndex, randomNeighbor)
        previousIndex = emptyIndex
      }

      this.blockRandomMove()
    },

    getNeighbors(index) {
      const neighbors = []
      const row = Math.floor(index / this.gridSize)
      const col = index % this.gridSize

      if (row > 0) {
        neighbors.push(index - this.gridSize)
      }

      if (row < this.gridSize - 1) {
        neighbors.push(index + this.gridSize)
      }

      if (col > 0) {
        neighbors.push(index - 1)
      }

      if (col < this.gridSize - 1) {
        neighbors.push(index + 1)
      }

      return neighbors
    },

    handleTileClick(index) {
      if (this.isWin) {
        return
      }

      const emptyIndex = this.tiles.indexOf(0)

      if (this.specialMoves > 0) {
        if (this.tiles[index] !== 0) {
          this.swapTiles(index, emptyIndex)
          this.specialMoves--
          this.moves++
          this.clearBlockedMove()
          this.blockRandomMove()
          this.checkWinAndSave()
        }
        return
      }

      if (index === this.blockedIndex) {
        return
      }

      const neighbors = this.getNeighbors(emptyIndex)

      if (neighbors.includes(index)) {
        this.swapTiles(emptyIndex, index)
        this.moves++
        this.clearBlockedMove()
        this.blockRandomMove()
        this.checkWinAndSave()
      }
    },

    checkWinAndSave() {
      if (this.isWin) {
        this.stopTimer()
        this.stopSpecialMoveTimer()
        this.saveRecord()
      }
    },

    swapTiles(idx1, idx2) {
      const temp = this.tiles[idx1]
      this.tiles[idx1] = this.tiles[idx2]
      this.tiles[idx2] = temp
    },
  },
  mounted() {
    this.initGame()
  },
  beforeUnmount() {
    this.stopTimer()
    this.stopSpecialMoveTimer()
  },
}
</script>

<style scoped lang="scss">
.puzzle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;

  &__content {
    text-align: center;
    width: 100%;
    max-width: 100%;
  }

  &__title {
    color: #fff;
    font-size: 32px;
    margin: 0 0 20px 0;
    font-family: sans-serif;
  }

  &__stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  &__stat {
    background: #222;
    padding: 10px 15px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;

    &--special {
      background: #4CAF50;
      animation: pulse 2s infinite;
    }
  }

  &__stat-label {
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
  }

  &__stat-value {
    color: #fff;
    font-size: 20px;
    font-weight: bold;

    &--record {
      color: #FFD700;
    }

    &--special {
      color: #fff;
      font-size: 24px;
    }
  }

  &__win {
    color: #4CAF50;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  &__board {
    display: inline-grid;
    gap: 3px;
    margin: 0 auto 30px;
    background-color: #222;
    padding: 3px;
    border-radius: 8px;
  }

  &__controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  &__restart {
    padding: 12px 40px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-family: sans-serif;
  }

  &__button {
    padding: 12px 20px;
    font-size: 18px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-family: sans-serif;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__hint {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    margin-top: 15px;
    animation: glow 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
  }
}

@media (max-width: 500px) {
  .puzzle {
    padding: 15px;

    &__title {
      font-size: 28px;
    }

    &__stats {
      gap: 10px;
    }

    &__stat {
      padding: 8px 12px;
    }

    &__stat-value {
      font-size: 16px;
    }

    &__restart,
    &__button {
      padding: 10px 30px;
      font-size: 14px;
    }
  }
}

@media (max-width: 350px) {
  .puzzle {
    &__title {
      font-size: 24px;
    }
  }
}
</style>