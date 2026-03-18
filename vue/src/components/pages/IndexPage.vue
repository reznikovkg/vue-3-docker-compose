<template>
  <div class="puzzle">
    <div class="puzzle__header">
      <div class="puzzle__title">Пятнашки</div>
      <div class="puzzle__stats">
        <div class="puzzle__moves">Ходов: {{ moves }}</div>
        <div class="puzzle__timer">{{ formattedTime }}</div>
        <div class="puzzle__speed" v-if="timerSpeed > 1">x{{ timerSpeed }}</div>
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
        v-for="mode in modes"
        :key="mode.value"
        class="puzzle__mode-button" 
        :class="{ 'puzzle__mode-button--active': currentMode === mode.value }"
        @click="() => setMode(mode.value)"
      >
        {{ mode.label }}
      </button>
    </div>

    <div class="puzzle__bonus" v-if="bonusActive">
      Бонусный ход
    </div>
    <Grid
      :cells="cells"
      :size="size"
      :current-mode="currentMode"
      :blocked-cell="blockedCell"
      :is-frozen="isFrozen"
      @cell-click="handleClick"
    />
    <div class="puzzle__controls">
      <button class="puzzle__button" @click="() => newGame()">Новая игра</button>
    </div>
    <div v-if="isSolved" class="puzzle__win">
      <div>Победа</div>
      <div>Время: {{ formattedTime }}</div>
      <div>Ходов: {{ moves }}</div>
      <div v-if="isNewRecord" class="puzzle__record">Новый рекорд</div>
    </div>
    <Records
      :records="records"
      :format-time="formatTime"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Grid from '@/components/Grid.vue'
import Records from '@/components/Records.vue'
export default {
  name: 'IndexPage',
  components: {
    Grid,
    Records
  },
  data() {
    return {
      sizeInput: 3,
      currentMode: 'normal',
      blockedCell: null,
      bonusActive: false,
      timerSpeed: 1,
      lastMoveTime: Date.now(),
      lastMoves: [],
      timerInterval: null,
      boostInterval: null,
      bonusInterval: null,
      modes: [
        { value: 'normal', label: 'Обычный режим' },
        { value: 'block', label: 'Режим блокировок' },
        { value: 'freeze', label: 'Режим заморозки' }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'cells',
      'moves',
      'size',
      'seconds',
      'penaltySeconds',
      'records',
      'emptyIndex',
      'isSolved',
      'formattedTime'
    ]),
    isNewRecord() {
      if (!this.isSolved) return false
      const sameSize = this.records.filter(r => r.size === this.size)
      if (sameSize.length < 5) return true
      const totalSeconds = this.seconds + this.penaltySeconds
      return totalSeconds < Math.max(...sameSize.map(r => r.time))
    }
  },
  methods: {
    ...mapActions([
      'newGame',
      'moveCell',
      'changeSize',
      'loadRecords',
      'tickTimer',
      'saveRecord'
    ]),
    setMode(mode) {
      this.currentMode = mode
      this.newGame()
      this.blockedCell = null
      this.lastMoves = []
      this.lastMoveTime = Date.now()
    },
    changeSize() {
      this.changeSize(this.sizeInput)
      this.newGame()
      this.blockedCell = null
      this.lastMoves = []
      this.lastMoveTime = Date.now()
    },
    handleClick(index) {
      if (this.isSolved) return
      if (this.bonusActive && index !== this.emptyIndex) {
        this.moveCell(index)
        this.bonusActive = false
        this.afterMove(index)
        return
      }
      if (!this.canMove(index)) return
      if (this.currentMode === 'block' && this.blockedCell === index) return
      if (this.currentMode === 'freeze' && this.isFrozen(index)) return
      this.moveCell(index)
      this.afterMove(index)
    },
    afterMove(index) {
      this.lastMoveTime = Date.now()
      this.timerSpeed = 1
      this.restartTimer()
      this.lastMoves.push({ from: index, to: this.emptyIndex })
      if (this.lastMoves.length > 2) {
        this.lastMoves.shift()
      }
      if (this.lastMoves.length === 2) {
        const [first, second] = this.lastMoves
        if (first.from === second.to && first.to === second.from) {
          this.$store.commit('SET_PENALTY_SECONDS', this.penaltySeconds + 10)
        }
      }
      if (this.currentMode === 'block') {
        this.updateBlockedCell()
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
    isFrozen(index) {
      if (this.currentMode !== 'freeze') return false
      return this.cells[index] === index + 1
    },
    updateBlockedCell() {
      const possible = this.cells
        .map((_, i) => i)
        .filter(i => this.canMove(i) && i !== this.emptyIndex)
      this.blockedCell = possible.length 
        ? possible[Math.floor(Math.random() * possible.length)]
        : null
    },
    formatTime(sec) {
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },
    updateTimerSpeed() {
      const timeSinceLastMove = (Date.now() - this.lastMoveTime) / 1000
      const newSpeed = timeSinceLastMove > 5 ? 2 : 1
      if (newSpeed !== this.timerSpeed) {
        this.timerSpeed = newSpeed
        this.restartTimer()
      }
    },
    restartTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
      }
      const interval = 1000 / this.timerSpeed
      this.timerInterval = setInterval(() => {
        this.tickTimer()
      }, interval)
    }
  },
  mounted() {
    this.loadRecords()
    this.newGame()
    this.lastMoveTime = Date.now()
    this.timerSpeed = 1
    this.restartTimer()
    this.boostInterval = setInterval(() => {
      this.updateTimerSpeed()
    }, 1000)
    this.bonusInterval = setInterval(() => {
      if (!this.isSolved) {
        this.bonusActive = true
      }
    }, 60000)
  },
  beforeUnmount() {
    if (this.timerInterval) clearInterval(this.timerInterval)
    if (this.boostInterval) clearInterval(this.boostInterval)
    if (this.bonusInterval) clearInterval(this.bonusInterval)
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
    align-items: center;
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
  &__speed {
    font-size: 14px;
    font-weight: bold;
    color: #2196F3;
    background: #0e1353;
    padding: 4px 8px;
    border-radius: 12px;
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
  &__controls {
    .puzzle__button {
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
  @media (max-width: 480px) {
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