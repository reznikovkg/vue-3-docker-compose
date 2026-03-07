<template>
  <div class="puzzle">
    <div class="puzzle__header">
      <div class="puzzle__title">Пятнашки</div>
      <div class="puzzle__stats">
        <div class="puzzle__moves">Ходов: {{ moves }}</div>
        <div class="puzzle__timer">{{ formatTime }}</div>
      </div>
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

    <div class="puzzle__mode-control">
      <button 
        class="puzzle__mode-button" 
        :class="{ 'puzzle__mode-button--active': !blockMode }"
        @click="() => setMode(false)"
      >
        Обычный режим
      </button>
      <button 
        class="puzzle__mode-button" 
        :class="{ 'puzzle__mode-button--active': blockMode }"
        @click="() => setMode(true)"
      >
        Режим блокировок
      </button>
    </div>

    <div class="puzzle__bonus" v-if="bonusActive">
      Бонусный ход
    </div>

    <div 
      class="puzzle__grid" 
      :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }"
    >
      <div 
        v-for="(cell, i) in cells" 
        :key="i"
        class="puzzle__cell" 
        :class="{ 
          'puzzle__cell--empty': cell === size * size,
          'puzzle__cell--blocked': blockMode && blockedCell === i
        }"
        @click="() => handleClick(i)"
        @touchstart.prevent="() => handleClick(i)"
      >
        <span v-if="cell !== size * size">{{ cell }}</span>
      </div>
    </div>
    <div class="puzzle__controls">
      <button class="puzzle__button" @click="() => newGame()">Новая игра</button>
    </div>
    <div v-if="isSolved" class="puzzle__win">
      <div>Победа</div>
      <div>Время: {{ formatTime }}</div>
      <div>Ходов: {{ moves }}</div>
      <div v-if="isNewRecord" class="puzzle__record">Новый рекорд</div>
    </div>

    <div class="puzzle__records">
      <div class="puzzle__records-title">Рекорды</div>
      <div v-for="(rec, idx) in records" :key="idx" class="puzzle__record-item">
        {{ rec.size }}x{{ rec.size }} - {{ formatTimeShort(rec.time) }} - {{ rec.moves }} ходов
      </div>
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
      sizeInput: 3,
      timer: null,
      seconds: 0,
      bonusActive: false,
      blockedCell: null,
      records: [],
      blockMode: false
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
    },
    formatTime() {
      const m = Math.floor(this.seconds / 60)
      const s = this.seconds % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },
    isNewRecord() {
      if (!this.isSolved) return false
      const sameSize = this.records.filter(r => r.size === this.size)
      if (sameSize.length < 5) return true
      return this.seconds < Math.max(...sameSize.map(r => r.time))
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
      this.seconds = 0
      this.blockedCell = null
      this.bonusActive = false
      this.startTimer()
    },
    setMode(mode) {
      if (this.blockMode !== mode) {
        this.blockMode = mode
        this.newGame()
      }
    },
    canMove(index) {
      const empty = this.emptyIndex
      const emptyRow = Math.floor(empty / this.size)
      const emptyCol = empty % this.size
      const row = Math.floor(index / this.size)
      const col = index % this.size
      return (Math.abs(emptyRow - row) + Math.abs(emptyCol - col)) === 1
    },
    handleClick(index) {
      if (this.isSolved) return
      if (this.bonusActive && index !== this.emptyIndex) {
        this.moveCell(index)
        this.bonusActive = false
        return
      }
      if (!this.canMove(index)) return
      if (this.blockMode && this.blockedCell === index) return
      this.moveCell(index)
    },
    moveCell(index) {
      const newCell = [...this.cells]
      const empty = this.emptyIndex
      newCell[empty] = newCell[index]
      newCell[index] = this.size * this.size
      this.cells = newCell
      this.moves++
      if (this.blockMode) {
        this.blockNextCell()
      }
      
      if (this.isSolved) {
        clearInterval(this.timer)
        this.checkRecord()
      }
    },
    changeSize() {
      if (this.sizeInput < 3) this.sizeInput = 3
      if (this.sizeInput > 10) this.sizeInput = 10
      if (this.sizeInput !== this.size) {
        this.size = this.sizeInput
        this.newGame()
      }
    },
    startTimer() {
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => {
        if (!this.isSolved) {
          this.seconds++
        }
      }, 1000)
    },
    blockNextCell() {
      if (this.isSolved) return
      const possible = this.cells
        .map((_, i) => i)
        .filter(i => this.canMove(i) && i !== this.emptyIndex)
      this.blockedCell = possible.length 
        ? possible[Math.floor(Math.random() * possible.length)]
        : null
    },
    loadRecords() {
      const saved = localStorage.getItem('puzzleRecords')
      if (saved) {
        try {
          this.records = JSON.parse(saved)
        } catch {}
      }
    },
    saveRecords() {
      localStorage.setItem('puzzleRecords', JSON.stringify(this.records))
    },
    checkRecord() {
      const newRecord = {
        size: this.size,
        time: this.seconds,
        moves: this.moves,
        date: Date.now()
      }
      const sameSize = this.records.filter(r => r.size === this.size)
      sameSize.push(newRecord)
      sameSize.sort((a, b) => a.time - b.time)
      const top5 = sameSize.slice(0, 5)
      const otherSizes = this.records.filter(r => r.size !== this.size)
      this.records = [...otherSizes, ...top5]
      this.saveRecords()
    },
    formatTimeShort(sec) {
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    }
  },
  mounted() {
    this.loadRecords()
    this.newGame()
    setInterval(() => {
      if (!this.isSolved) {
        this.bonusActive = true
      }
    }, 60000)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
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
  &__stats {
    display: flex;
    gap: 15px;
  }
  
  &__moves {
    font-size: 18px;
    font-weight: bold;
    color: #4CAF50;
  }
  &__timer {
    font-size: 18px;
    font-weight: bold;
    color: #2196F3;
    font-family: monospace;
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
  &__mode-control {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  &__mode-button {
    flex: 1;
    padding: 10px;
    font-size: 16px;
    background: #e0e0e0;
    color: #333;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #d0d0d0;
    }
    
    &--active {
      background: #4CAF50;
      color: white;
      &:hover {
        background: #45a049;
      }
    }
  }
  &__bonus {
    margin-bottom: 15px;
    padding: 10px;
    background: #fff3cd;
    border-radius: 8px;
    text-align: center;
    color: #856404;
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
    &:active:not(&--empty):not(&--blocked) {
      transform: scale(0.95);
      background: #f0f0f0;
    }
    &--empty {
      background: transparent;
      box-shadow: none;
      cursor: default;
      pointer-events: none;
    }
    &--blocked {
      background: #ffcdd2;
      cursor: not-allowed;
      opacity: 0.7;
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
    margin-bottom: 20px;
  }
  &__record {
    color: #ff9800;
    font-size: 20px;
    margin-top: 10px;
  }
  &__records {
    margin-top: 30px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 12px;
  }
  &__records-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }
  &__record-item {
    padding: 8px;
    background: white;
    border-radius: 6px;
    margin-bottom: 5px;
    font-size: 14px;
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
    &__moves,
    &__timer {
      font-size: 14px;
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
    &__mode-button {
      font-size: 14px;
      padding: 8px;
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