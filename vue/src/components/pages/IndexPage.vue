<template>
  <div class="puzzle">
    <div class="puzzle__header">
      <h1>Пятнашки</h1>
      <div class="puzzle__moves">Ходов: {{ moves }}</div>
    </div>

    <div class="puzzle__grid">
      <div 
        v-for="(cell, i) in cell" 
        :key="i"
        class="puzzle__cell" 
        :class="{ 'puzzle__cell--empty': cell === 9 }"
        @click="() => moveCell(i)"
        @touchstart.prevent="() => moveCell(i)"
      >
        <span v-if="cell !== 9">{{ cell }}</span>
      </div>
    </div>
    <div class="puzzle__controls">
      <button class="puzzle__button" @click="() => newGame()">Новая игра</button>
    </div>
    <div v-if="isSolved" class="puzzle__win">
      Победа
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      cell: [],
      moves: 0
    }
  },
  computed: {
    emptyIndex() {
      return this.cell.indexOf(9)
    },
    isSolved() {
      for(let i = 0; i < 8; i++) {
        if(this.cell[i] !== i + 1) return false
      }
      return true
    }
  },
  methods: {
    shuffle(arr) {
      const newArr = [...arr]
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
      }
      return newArr
    },
    newGame() {
      let newCell = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      
      do {
        newCell = this.shuffle(newCell)
      } while (newCell[8] !== 9)
      
      this.cell = newCell
      this.moves = 0
    },
    canMove(index) {
      const empty = this.emptyIndex
      const emptyRow = Math.floor(empty / 3)
      const emptyCol = empty % 3
      const row = Math.floor(index / 3)
      const col = index % 3
      return (Math.abs(emptyRow - row) + Math.abs(emptyCol - col)) === 1
    },
    moveCell(index) {
      if(this.isSolved) return
      if(!this.canMove(index)) return
      const newCell = [...this.cell]
      const empty = this.emptyIndex
      newCell[empty] = newCell[index]
      newCell[index] = 9
      this.cell = newCell
      this.moves++
    }
  },
  mounted() {
    this.newGame()
  }
}
</script>

<style scoped lang="scss">
.puzzle {
  max-width: 400px;
  margin: 30px auto;
  padding: 20px;
  font-family: Arial, sans-serif;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
  }

  &__moves {
    font-size: 18px;
    font-weight: bold;
    color: #4CAF50;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    background: #ccc;
    padding: 15px;
    border-radius: 12px;
    margin-bottom: 20px;
    aspect-ratio: 1;
  }
  &__cell {
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: bold;
    color: #333;
    cursor: pointer;
    aspect-ratio: 1;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.2s;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    &:active {
      transform: scale(0.95);
      background: #f0f0f0;
    }
    &--empty {
      background: transparent;
      box-shadow: none;
      cursor: default;
      pointer-events: none;
    }
  }

  &__button {
    padding: 10px 20px;
    font-size: 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin: 10px;
    transition: all 0.2s;
    &:active {
      transform: scale(0.98);
      background: #45a049;
    }
  }

  &__win {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #4CAF50;
    padding: 15px;
    background: #e8f5e9;
    border-radius: 8px;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 480px) {
  .puzzle {
    padding: 10px;

    &__header {
      h1 {
        font-size: 20px;
      }
    }
    &__moves {
      font-size: 16px;
    }
    &__cell {
      font-size: 24px;
    }
    &__button {
      padding: 8px 16px;
      font-size: 14px;
    }
    &__win {
      font-size: 20px;
    }
  }
}
</style>