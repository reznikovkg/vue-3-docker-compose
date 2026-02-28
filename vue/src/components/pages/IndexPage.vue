<template>
  <div class="puzzle">
    <div class="puzzle__header">
      <div class="puzzle__title">Пятнашки</div>
      <div class="puzzle__moves">Ходов: {{ moves }}</div>
    </div>

    <div class="puzzle__size-control">
      <label class="puzzle__label">
        Размер N:
        <input 
          type="number"
          v-model.number="sizeInput"
          min="3"
          max="10"
          class="puzzle__input"
          @change="() => changeSize()"
        >
      </label>
      <span class="puzzle__size-info">{{ size }} x {{ size }}</span>
    </div>

    <div 
      class="puzzle__grid" 
      :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }"
    >
      <div 
        v-for="(cell, i) in cells" 
        :key="i"
        class="puzzle__cell" 
        :class="{ 'puzzle__cell--empty': cell === size * size }"
        @click="() => moveCell(i)"
        @touchstart.prevent="() => moveCell(i)"
      >
        <span v-if="cell !== size * size">{{ cell }}</span>
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
      cells: [],
      moves: 0,
      size: 3,
      sizeInput: 3
    }
  },
  computed: {
    emptyIndex() {
      return this.cells.indexOf(this.size * this.size)
    },
    isSolved() {
      return this.cells.every((cell, index) => {
        if (index === this.cells.length - 1) {
          return cell === this.size * this.size
        }
        return cell === index + 1
      })
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
    createArray() {
      const total = this.size * this.size
      const arr = []
      for (let i = 1; i <= total; i++) {
        arr.push(i)
      }
      return arr
    },
    newGame() {
      let newCells = this.createArray()

      do {
        newCells = this.shuffle(newCells)
      } while (newCells[this.size * this.size - 1] !== this.size * this.size)

      this.cells = newCells 
      this.moves = 0
    },
    canMove(index) {
      const empty = this.emptyIndex
      const emptyRow = Math.floor(empty / this.size)
      const emptyCol = empty % this.size
      const row = Math.floor(index / this.size)
      const col = index % this.size
      return (Math.abs(emptyRow - row) + Math.abs(emptyCol - col)) === 1
    },
    moveCell(index) {
      if (this.isSolved) return
      if (!this.canMove(index)) return
      const newCell = [...this.cells]
      const empty = this.emptyIndex
      newCell[empty] = newCell[index]
      newCell[index] = this.size * this.size
      this.cells = newCell
      this.moves++
    },
    changeSize() {
      if (this.sizeInput < 3) this.sizeInput = 3
      if (this.sizeInput > 10) this.sizeInput = 10
      if (this.sizeInput !== this.size) {
        this.size = this.sizeInput
        this.newGame()
      }
    }
  },
  mounted() {
    this.newGame()
  }
}
</script>

<style scoped lang="scss">
.puzzle {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  font-family: Arial, sans-serif;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  &__title { 
    margin: 0;
    font-size: 24px;
    color: #333;
  }
  &__moves {
    font-size: 18px;
    font-weight: bold;
    color: #4CAF50;
  }
  
  &__size-control {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  &__label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    color: #333;
  }
  
  &__input {
    width: 70px;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
    
    &:focus {
      outline: none;
      border-color: #4CAF50;
    }
  }
  
  &__size-info {
    font-size: 16px;
    color: #666;
    font-weight: bold;
  }
  &__grid {
    display: grid;
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
    font-size: clamp(14px, 5vw, 36px);
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
    &__title { 
      font-size: 20px;
    }
    &__moves {
      font-size: 16px;
    }
    &__size-control {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
    }
    &__label {
      font-size: 14px;
    }
    &__input {
      width: 60px;
      padding: 6px;
      font-size: 14px;
    }
    &__size-info {
      font-size: 14px;
    }
    &__cell {
      font-size: clamp(12px, 4vw, 24px);
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