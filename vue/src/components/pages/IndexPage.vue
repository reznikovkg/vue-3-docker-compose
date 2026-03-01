<template>
  <div class="puzzle">
    <div class="puzzle__content">
      <h2 class="puzzle__title">Пятнашки {{ gridSize }}×{{ gridSize }}</h2>

      <div v-if="isWin" class="puzzle__win">ПОБЕДА!</div>

      <div class="puzzle__status">Ходы: {{ moves }}</div>

      <div class="puzzle__board" :style="boardStyle">
        <PuzzleTile
            v-for="tile in tileList"
            :key="tile.index"
            :value="tile.value"
            :is-empty="tile.isEmpty"
            :is-win="isWin"
            :tile-style="tileStyle"
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
  },
  methods: {
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
      this.moves = 0

      const total = this.gridSize * this.gridSize

      this.tiles = Array.from(
          { length: total },
          (_, i) => {
            return (i + 1) % total
          }
      )

      this.shuffleBoard()
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
      const neighbors = this.getNeighbors(emptyIndex)

      if (neighbors.includes(index)) {
        this.swapTiles(emptyIndex, index)
        this.moves++
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

  &__status {
    color: #888;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: sans-serif;
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
}

@media (max-width: 500px) {
  .puzzle {
    padding: 15px;

    &__title {
      font-size: 28px;
    }

    &__status {
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