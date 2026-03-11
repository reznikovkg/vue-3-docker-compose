<template>
  <div class="main">

    <div v-if="!isWin" class="board" :style="{ '--size': size }">

      <div
        class="cell"
        v-for="(cell, index) in cells"
        :key="index"
        :class="{ empty: cell === null }"
        @click="moveTile(index)"
      >
        {{ cell }}
      </div>

    </div>

    <div v-else class="win">
      <h2>Вы собрали пятнашки!</h2>
      <router-link :to="{ path: '/' }">
        <button class="bttn">Вернуться на главную</button>
      </router-link>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      size: Number(this.$route.query.size) || 4,
      cells: [],
      isWin: false,
    }
  },

  mounted() {
    this.createBoard();
  },

  methods: {

    createBoard() {

      for (let i = 1; i < this.size * this.size; i++) {
        this.cells.push(i);
      }
      this.cells.push(null);

      this.shuffle(this.cells);
    },

    shuffle(array) {

      let startIndex = this.size * this.size - 1

      const directions = [
        this.size,
        -this.size,
        1,
        -1
      ]

      for (let i = 0; i < Math.pow(this.size, 3); i++) {

        let direction = directions[Math.floor(Math.random() * directions.length)]

        let newIndex = startIndex + direction

        if (newIndex < 0 || newIndex >= this.size * this.size) {
          i--
          continue
        }

        if (direction === 1 && startIndex % this.size === this.size - 1) {
          i--
          continue
        }

        if (direction === -1 && startIndex % this.size === 0) {
          i--
          continue
        }

        const temp = array[startIndex]
        array[startIndex] = array[newIndex]
        array[newIndex] = temp

        startIndex = newIndex
      }

    },

    moveTile(index) {

      const row = Math.floor(index / this.size)
      const col = index % this.size

      const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
      ]

      for (const [dx, dy] of directions) {

        const newRow = row + dx
        const newCol = col + dy

        if (
          newRow >= 0 && newRow < this.size &&
          newCol >= 0 && newCol < this.size
        ) {

          const newIndex = newRow * this.size + newCol

          if (this.cells[newIndex] === null) {

            this.cells[newIndex] = this.cells[index]
            this.cells[index] = null

            if (this.checkWin()) {
              this.isWin = true
            }

            break
          }
        }
      }
    },

    checkWin() {

      for (let i = 0; i < this.cells.length - 1; i++) {
        if (this.cells[i] !== i + 1) return false
      }

      return this.cells[this.cells.length - 1] === null
    }

  }
}
</script>

<style lang="scss">

$bg-color: #222222;
$tile-color: #00639b;
$button-color: teal;

body, html {
  margin: 0;
  padding: 0;
  background-color: $bg-color;
}

.main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.board {
  display: grid;
  grid-template-columns: repeat(var(--size), 1fr);
  gap: 5px;
  padding: 5px;
  background-color: $bg-color;
  border-radius: 10px;
}

.cell {
  width: calc(90vw / var(--size));
  aspect-ratio: 1;

  max-width: 80px;
  min-width: 50px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: calc(2vw + 10px);
  color: white;
  background-color: $tile-color;

  border-radius: 10px;
  cursor: pointer; 
  user-select: none;

  transition: background 0.2s;

  &:hover {
    background-color: darken($tile-color, 10%);
  }

  &.empty {
    background-color: transparent;
    border: none;
    cursor: default;
  }
}

.win {
  text-align: center;
  color: #000;

  button {
    margin-top: 20px;
    padding: 10px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background-color: $button-color;

    &:hover {
      background-color: #ccc;
    }
  }
}

</style>