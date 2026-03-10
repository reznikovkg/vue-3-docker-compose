<template>
  <div class="main">
    <div class="board" :style="{ '--size': size }">
      <div class="row" v-for="(row, rowIndex) in rows" :key="rowIndex">
        <div 
          class="cell" 
          v-for="(cell, colIndex) in row" 
          :key="colIndex" 
          @click="moveTile(rowIndex, colIndex)"
          :class="{ empty: cell === null }"
        >
          {{ cell }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      size: Number(this.$route.query.size) || 4,
      rows: []
    }
  },

  mounted() {
    this.createBoard()
  },

  methods: {
    createBoard() {
      let numbers = []

      while(numbers.length !== this.size * this.size - 1) {
          const newCell = Math.floor(Math.random() * (this.size * this.size - 1)) + 1;
          if(!numbers.includes(newCell)){
              numbers.push(newCell)
          }
      }

      numbers.push(null) 

      this.rows = []
      for (let i = 0; i < this.size; i++) {
          this.rows.push(numbers.slice(i * this.size, (i + 1) * this.size))
      }
    },

    checkWin() {
        let count = 1
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
            if (i === this.size - 1 && j === this.size - 1) {
                if (this.rows[i][j] !== null) return false
            } else {
                if (this.rows[i][j] !== count) return false
                count++
            }
            }
        }
            return true
    },

    moveTile(row, col) {
      const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0]
      ]
      for (const [dx, dy] of directions) {
        const newRow = row + dx
        const newCol = col + dy
        if (
          newRow >= 0 && newRow < this.size &&
          newCol >= 0 && newCol < this.size &&
          this.rows[newRow][newCol] === null
        ) {
          this.rows[newRow][newCol] = this.rows[row][col]
          this.rows[row][col] = null
          
        if(this.checkWin()) {
            alert("Поздравляем вы победили")
        }

          break
        }
      }
    }
  }
}
</script>

<style>

body, html {
  margin: 0;
  padding: 0;
  background-color: #222222;
}

.main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.board {
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  padding: 5px;
  background-color: #222222;
}

.row {
  display: flex;
}

.cell {
  color: white;
  width: calc(90vw / var(--size));
  height: calc(90vw / var(--size));
  max-width: 80px;
  max-height: 80px;
  min-width: 50px;
  min-height: 50px;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: calc(2vw + 10px);
  cursor: pointer;
  user-select: none;
  background-color: #00639b;
  border-radius: 10px;
  transition: background 0.2s;
}

.empty {
  background-color: transparent;
  border: none;
}
</style>