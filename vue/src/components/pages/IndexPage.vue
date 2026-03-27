<template>
  <div class="game-area">
    <div class="game-area__content">
      <h2 class="game-area__title">Пятнашки {{ boardSize }}×{{ boardSize }}</h2>

      <div v-if="winStatus" class="game-area__message">ПОБЕДА!</div>

      <div class="game-area__stats">Ходы: {{ stepCount }}</div>

      <div class="game-area__field" :style="fieldConfig">
        <PuzzleTile
            v-for="item in tileArray"
            :key="item.pos"
            :num="item.num"
            :is-void="item.isVoid"
            :finished="winStatus"
            :tile-size="tileSize"
            @click="() => onTileTap(item.pos)"
        />
      </div>

      <div class="game-area__controls">
        <button
            class="game-area__btn game-area__btn--minus"
            @click="() => resizeBoard(-1)"
            :disabled="boardSize <= minBoardSize"
        >
          −
        </button>

        <button
            class="game-area__btn game-area__btn--reset"
            @click="() => resetGame()"
        >
          Перемешать
        </button>

        <button
            class="game-area__btn game-area__btn--plus"
            @click="() => resizeBoard(1)"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PuzzleTile from './PuzzleTile.vue'

export default {
  name: 'IndexPage',
  components: {
    PuzzleTile
  },
  data() {
    return {
      boardSize: 4,
      minBoardSize: 3,
      gridData: [],
      stepCount: 0
    }
  },
  computed: {
    winStatus() {
      return this.validateWin()
    },

    tileArray() {
      return this.gridData.map((val, idx) => {
        return {
          pos: idx,
          num: val,
          isVoid: val === 0
        }
      })
    },

    fieldConfig() {
      return {
        'grid-template-columns': `repeat(${this.boardSize}, 1fr)`,
        'grid-template-rows': `repeat(${this.boardSize}, 1fr)`
      }
    },

    tileSize() {
      const base = 80
      const min = 25
      const size = Math.max(min, base - (this.boardSize - 4) * 5)
      const font = Math.max(10, 28 - (this.boardSize - 4) * 2)

      return {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${font}px`
      }
    }
  },
  methods: {
    validateWin() {
      const total = this.boardSize * this.boardSize

      for (let i = 0; i < total; i++) {
        const target = (i < total - 1) ? (i + 1) : 0

        if (this.gridData[i] !== target) {
          return false
        }
      }

      return true
    },

    resizeBoard(delta) {
      const newSize = this.boardSize + delta

      if (newSize >= this.minBoardSize) {
        this.boardSize = newSize
        this.resetGame()
      }
    },

    resetGame() {
      this.stepCount = 0

      const total = this.boardSize * this.boardSize

      this.gridData = Array.from(
          { length: total },
          (_, i) => {
            return (i + 1) % total
          }
      )

      this.mixBoard()
    },

    mixBoard() {
      let lastPos = -1
      const mixSteps = this.boardSize * this.boardSize * 10

      for (let i = 0; i < mixSteps; i++) {
        const voidPos = this.gridData.indexOf(0)
        const adj = this.getAdjacent(voidPos)
        const allowed = adj.filter((n) => {
          return n !== lastPos
        })
        const chosen = allowed[Math.floor(Math.random() * allowed.length)]

        this.switchCells(voidPos, chosen)
        lastPos = voidPos
      }
    },

    getAdjacent(pos) {
      const result = []
      const row = Math.floor(pos / this.boardSize)
      const col = pos % this.boardSize

      if (row > 0) {
        result.push(pos - this.boardSize)
      }

      if (row < this.boardSize - 1) {
        result.push(pos + this.boardSize)
      }

      if (col > 0) {
        result.push(pos - 1)
      }

      if (col < this.boardSize - 1) {
        result.push(pos + 1)
      }

      return result
    },

    onTileTap(pos) {
      if (this.winStatus) {
        return
      }

      const voidPos = this.gridData.indexOf(0)
      const adj = this.getAdjacent(voidPos)

      if (adj.includes(pos)) {
        this.switchCells(voidPos, pos)
        this.stepCount++
      }
    },

    switchCells(p1, p2) {
      const buffer = this.gridData[p1]
      this.gridData[p1] = this.gridData[p2]
      this.gridData[p2] = buffer
    }
  },
  mounted() {
    this.resetGame()
  }
}
</script>

<style scoped lang="scss">
.game-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0d47a1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 500px) {
    padding: 15px;
  }

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

    @media (max-width: 500px) {
      font-size: 28px;
    }

    @media (max-width: 350px) {
      font-size: 24px;
    }
  }

  &__stats {
    color: #64b5f6;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: sans-serif;

    @media (max-width: 500px) {
      font-size: 16px;
    }
  }

  &__message {
    color: #81c784;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  &__field {
    display: inline-grid;
    gap: 3px;
    margin: 0 auto 30px;
    background-color: #1565c0;
    padding: 3px;
    border-radius: 8px;
  }

  &__controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  &__btn {
    padding: 12px 20px;
    font-size: 18px;
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

    @media (max-width: 500px) {
      padding: 10px 30px;
      font-size: 14px;
    }

    &--reset {
      padding: 12px 40px;
      font-size: 16px;
      background-color: #1976d2;
    }

    &--minus {
      background-color: #0d47a1;
    }

    &--plus {
      background-color: #0d47a1;
    }
  }
}
</style>