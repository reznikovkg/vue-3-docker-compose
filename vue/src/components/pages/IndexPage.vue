<template>
  <div class="puzzle">
    <div class="puzzle__content">
      <h2 class="puzzle__title">Пятнашки</h2>

      <div v-if="isWin" class="puzzle__win">ПОБЕДА!</div>

      <div class="puzzle__status">Ходы: {{ moves }}</div>

      <div class="puzzle__board">
        <PuzzleTile
            v-for="tile in tileList"
            :key="tile.index"
            :value="tile.value"
            :is-empty="tile.isEmpty"
            :is-win="isWin"
            @click="() => handleTileClick(tile.index)"
        />
      </div>
      <button class="puzzle__restart" @click="() => initGame()">Перемешать</button>
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

      for (let i = 0; i < 150; i++) {
        const emptyIndex = this.tiles.indexOf(0)
        const neighbors = this.getNeighbors(emptyIndex)
        const validNeighbors = neighbors.filter((n) => {
          return n !== previousIndex
        })
        const randomNeighbor = validNeighbors[
            Math.floor(Math.random() * validNeighbors.length)
            ]

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
  }
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
    max-width: 400px;
  }

  &__title {
    color: #fff;
    font-size: 36px;
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
    display: grid;
    grid-template-columns: repeat(4, 80px);
    grid-template-rows: repeat(4, 80px);
    gap: 5px;
    margin: 0 auto 30px;
  }

  &__restart {
    padding: 15px 50px;
    font-size: 18px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-family: sans-serif;
  }
}

@media (max-width: 500px) {
  .puzzle {
    padding: 15px;

    &__title {
      font-size: 32px;
    }

    &__status {
      font-size: 16px;
    }

    &__board {
      grid-template-columns: repeat(4, 70px);
      grid-template-rows: repeat(4, 70px);
    }

    &__restart {
      padding: 12px 40px;
      font-size: 16px;
    }
  }
}

@media (max-width: 350px) {
  .puzzle {
    &__board {
      grid-template-columns: repeat(4, 60px);
      grid-template-rows: repeat(4, 60px);
    }
  }
}
</style>