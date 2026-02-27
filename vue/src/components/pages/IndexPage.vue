<template>
  <div class="puzzle">
    <div class="puzzle__content">
      <h2>Пятнашки</h2>
      <div class="puzzle__status">Ходы: {{ moves }}</div>
      <div class="puzzle__board">
        <div v-for="(tile, index) in tiles" :key="index" class="puzzle__tile" @click="() => handleTileClick(index)">
          <span v-if="tile !== 0">{{ tile }}</span>
        </div>
      </div>
      <button class="puzzle__restart" @click="() => initGame()">Перемешать</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PuzzleGame',
  data() {
    return {
      gridSize: 4,
      tiles: [],
      moves: 0,
    }
  },
  methods: {
    initGame() {
      this.moves = 0
      const total = this.gridSize * this.gridSize
      this.tiles = Array.from({ length: total }, (_, i) => (i + 1) % total)
    },

    getNeighbors(index) {
      const neighbors = []
      const row = Math.floor(index / this.gridSize)
      const col = index % this.gridSize

      if (row > 0) neighbors.push(index - this.gridSize)
      if (row < this.gridSize - 1) neighbors.push(index + this.gridSize)
      if (col > 0) neighbors.push(index - 1)
      if (col < this.gridSize - 1) neighbors.push(index + 1)

      return neighbors
    },

    handleTileClick(index) {
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
    }
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

  h2 {
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

  &__board {
    display: grid;
    grid-template-columns: repeat(4, 80px);
    grid-template-rows: repeat(4, 80px);
    gap: 5px;
    margin: 0 auto 30px;
  }

  &__tile {
    width: 80px;
    height: 80px;
    background-color: #333;
    color: #fff;
    font-size: 28px;
    font-weight: bold;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
    cursor: pointer;
    user-select: none;
    transition: all 0.15s ease;

    &:active {
      transform: scale(0.95);
      background-color: #555;
    }

    &--empty {
      background-color: transparent;
      cursor: default;
    }
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
</style>
