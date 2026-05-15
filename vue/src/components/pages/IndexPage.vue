<template>
  <div class="puzzle">
    <header class="puzzle__header">
      <h1 class="puzzle__title">Пятнашки</h1>
      <div class="puzzle__stats">
        <div class="puzzle__stat puzzle__stat--moves">
          <span class="puzzle__stat-label">Ходы</span>
          <span class="puzzle__stat-value">{{ stepCount }}</span>
        </div>
        <div class="puzzle__stat puzzle__stat--time">
          <span class="puzzle__stat-label">Время</span>
          <span class="puzzle__stat-value">{{ formatTime(seconds) }}</span>
        </div>
        <div v-if="bonusCharges > 0" class="puzzle__stat puzzle__stat--bonus">
          <span class="puzzle__stat-label">Бонус</span>
          <span class="puzzle__stat-value">×{{ bonusCharges }}</span>
        </div>
      </div>
    </header>

    <div class="puzzle__controls">
      <div class="puzzle__group">
        <span class="puzzle__group-label">Размер</span>
        <div class="puzzle__group-row">
          <button
              class="puzzle__btn puzzle__btn--icon"
              :disabled="boardSize <= minSize"
              @click="() => changeSize(-1)"
          >−</button>
          <span class="puzzle__size">{{ boardSize }}×{{ boardSize }}</span>
          <button
              class="puzzle__btn puzzle__btn--icon"
              :disabled="boardSize >= maxSize"
              @click="() => changeSize(1)"
          >+</button>
        </div>
      </div>

      <div class="puzzle__group">
        <span class="puzzle__group-label">Режим</span>
        <div class="puzzle__group-row">
          <button
              class="puzzle__tab"
              :class="{ 'puzzle__tab--active': !blockMode }"
              @click="() => setMode(false)"
          >Обычный</button>
          <button
              class="puzzle__tab"
              :class="{ 'puzzle__tab--active': blockMode }"
              @click="() => setMode(true)"
          >Блок</button>
        </div>
      </div>

      <button
          class="puzzle__btn puzzle__btn--primary"
          @click="() => newGame()"
      >Новая игра</button>
    </div>

    <transition name="fade">
      <div v-if="bonusCharges > 0 && !isSolved" class="puzzle__bonus">
        Бонусный ход активен — нажми любую клетку
        <span v-if="bonusCharges > 1">×{{ bonusCharges }}</span>
      </div>
    </transition>

    <transition name="slide-up">
      <div v-if="isSolved" class="puzzle__win">
        <div class="puzzle__win-title">Победа</div>
        <div class="puzzle__win-stats">
          <span>{{ formatTime(seconds) }}</span>
          <span>·</span>
          <span>{{ stepCount }} ходов</span>
        </div>
        <div v-if="isNewRecord" class="puzzle__win-record">Новый рекорд</div>
        <button
            class="puzzle__btn puzzle__btn--primary"
            @click="() => newGame()"
        >Ещё раз</button>
      </div>
    </transition>

    <div
        class="puzzle__grid"
        :class="{ 'puzzle__grid--solved': isSolved }"
        :style="gridStyle"
    >
      <Tile
          v-for="(val, idx) in gridData"
          :key="idx"
          :num="val"
          :is-void="val === 0"
          :is-blocked="blockMode && blockedCell === idx && val !== 0"
          :is-solved="isSolved"
          :is-movable="!isSolved && !bonusCharges && isAdjacent(idx)"
          :is-bonus-target="bonusCharges > 0 && !isSolved && val !== 0"
          :tile-size="tileSize"
          @click="() => onTileClick(idx)"
      />
    </div>

    <RecordsPanel
        :records="records"
        :size="boardSize"
        :block-mode="blockMode"
    />

    <div class="puzzle__bar">
      <div class="puzzle__bar-fill" :style="{ width: bonusBarPct + '%' }"></div>
    </div>
    <span class="puzzle__bar-label">Бонус через {{ 60 - (seconds % 60) }} с</span>
  </div>
</template>

<script>
import Tile from './Tile.vue'
import RecordsPanel from './RecordsPanel.vue'

const LS_KEY = 'puzzle15_records_v2'

export default {
  name: 'IndexPage',
  components: {
    Tile,
    RecordsPanel
  },

  data() {
    return {
      boardSize: 4,
      minSize: 3,
      maxSize: 10,
      gridData: [],
      stepCount: 0,
      seconds: 0,
      timerInterval: null,
      bonusInterval: null,
      bonusCharges: 0,
      blockedCell: null,
      blockMode: false,
      records: []
    }
  },

  computed: {
    isSolved() {
      if (!this.gridData.length) return false
      const total = this.boardSize * this.boardSize
      for (let i = 0; i < total; i++) {
        const target = i < total - 1 ? i + 1 : 0
        if (this.gridData[i] !== target) return false
      }
      return true
    },

    isNewRecord() {
      if (!this.isSolved) return false
      const same = this.records.filter(r => r.size === this.boardSize)
      if (same.length < 5) return true
      return this.seconds < Math.max(...same.map(r => r.time))
    },

    bonusBarPct() {
      return ((this.seconds % 60) / 60) * 100
    },

    tileSize() {
      const sz = Math.max(28, 76 - (this.boardSize - 4) * 6)
      const fs = Math.max(10, 26 - (this.boardSize - 4) * 2)
      return { width: `${sz}px`, height: `${sz}px`, fontSize: `${fs}px` }
    },

    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${this.boardSize}, 1fr)`
      }
    }
  },

  methods: {
    formatTime(sec) {
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    isAdjacent(pos) {
      const voidPos = this.gridData.indexOf(0)
      return this.getAdjacent(voidPos).includes(pos)
    },

    getAdjacent(pos) {
      const result = []
      const row = Math.floor(pos / this.boardSize)
      const col = pos % this.boardSize
      if (row > 0) result.push(pos - this.boardSize)
      if (row < this.boardSize - 1) result.push(pos + this.boardSize)
      if (col > 0) result.push(pos - 1)
      if (col < this.boardSize - 1) result.push(pos + 1)
      return result
    },

    swap(p1, p2) {
      const g = [...this.gridData]
      ;[g[p1], g[p2]] = [g[p2], g[p1]]
      this.gridData = g
    },

    newGame() {
      this.stepCount = 0
      this.seconds = 0
      this.bonusCharges = 0
      this.blockedCell = null
      const total = this.boardSize * this.boardSize
      this.gridData = Array.from({ length: total }, (_, i) => (i + 1) % total)
      this.mixBoard()
      this.startTimer()
      this.startBonusTimer()
    },
    mixBoard() {
      let lastPos = -1
      const steps = this.boardSize * this.boardSize * 20
      for (let i = 0; i < steps; i++) {
        const voidPos = this.gridData.indexOf(0)
        const adj = this.getAdjacent(voidPos).filter(n => n !== lastPos)
        const chosen = adj[Math.floor(Math.random() * adj.length)]
        this.swap(voidPos, chosen)
        lastPos = voidPos
      }
    },

    onTileClick(pos) {
      if (this.isSolved) return
      const voidPos = this.gridData.indexOf(0)
      if (this.bonusCharges > 0 && this.gridData[pos] !== 0) {
        this.swap(voidPos, pos)
        this.stepCount++
        this.bonusCharges--
        if (this.blockMode) this.pickBlockedCell()
        this.checkWin()
        return
      }
      if (!this.getAdjacent(voidPos).includes(pos)) return
      if (this.blockMode && this.blockedCell === pos) return
      this.swap(voidPos, pos)
      this.stepCount++
      if (this.blockMode) this.pickBlockedCell()
      this.checkWin()
    },

    pickBlockedCell() {
      if (this.isSolved) {
        this.blockedCell = null
        return
      }

      const voidPos    = this.gridData.indexOf(0)
      const candidates = this.getAdjacent(voidPos).filter(i => this.gridData[i] !== 0)

      this.blockedCell = candidates.length
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : null
    },

    checkWin() {
      if (this.isSolved) {
        this.stopTimer()
        this.stopBonusTimer()
        this.saveRecord()
      }
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerInterval = setInterval(() => {
        if (!this.isSolved) this.seconds++
      }, 1000)
    },

    stopTimer() {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    },

    startBonusTimer() {
      if (this.bonusInterval) clearInterval(this.bonusInterval)
      this.bonusInterval = setInterval(() => {
        if (!this.isSolved) this.bonusCharges++
      }, 60000)
    },

    stopBonusTimer() {
      clearInterval(this.bonusInterval)
      this.bonusInterval = null
    },

    changeSize(delta) {
      const newSize = this.boardSize + delta
      if (newSize < this.minSize || newSize > this.maxSize) return
      this.boardSize = newSize
      this.newGame()
    },

    setMode(mode) {
      if (this.blockMode === mode) return
      this.blockMode = mode
      this.newGame()
    },

    saveRecord() {
      const rec = {
        size: this.boardSize,
        time: this.seconds,
        moves: this.stepCount,
        blockMode: this.blockMode,
        date: Date.now()
      }
      const others = this.records.filter(r => r.size !== this.boardSize)
      const same = [...this.records.filter(r => r.size === this.boardSize), rec]
          .sort((a, b) => a.time - b.time)
          .slice(0, 5)
      this.records = [...others, ...same]
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(this.records))
      } catch {}
    },

    loadRecords() {
      try {
        this.records = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
      } catch {}
    }
  },

  mounted() {
    this.loadRecords()
    this.newGame()
  },

  beforeUnmount() {
    this.stopTimer()
    this.stopBonusTimer()
  }
}
</script>

<style scoped lang="scss">
.puzzle {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px 48px;
  gap: 14px;
  background: #f0f2f7;
  font-family: 'Space Mono', monospace;
  box-sizing: border-box;

  &__header {
    width: 100%;
    max-width: 520px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border: 1px solid #d1d5e8;
    border-radius: 16px;
    padding: 14px 18px;
    box-shadow: 0 2px 8px rgba(55, 48, 163, 0.06);
    box-sizing: border-box;
  }

  &__title {
    font-family: 'Unbounded', sans-serif;
    font-size: clamp(14px, 4vw, 20px);
    font-weight: 900;
    letter-spacing: 0.04em;
    color: #3730a3;
    margin: 0;
  }

  &__stats {
    display: flex;
    gap: 8px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: #e8eaf2;
    border-radius: 10px;
    padding: 5px 10px;
    min-width: 52px;

    &--moves .puzzle__stat-value { color: #3730a3; }
    &--time  .puzzle__stat-value { color: #1e1b4b; font-size: 14px; }
    &--bonus {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      .puzzle__stat-value { color: #d97706; }
    }
  }

  &__stat-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6b7280;
    font-weight: 700;
  }

  &__stat-value {
    font-weight: 700;
    font-size: 15px;
    color: #1e1b4b;
  }

  &__controls {
    width: 100%;
    max-width: 520px;
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-wrap: wrap;
    background: #ffffff;
    border: 1px solid #d1d5e8;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 2px 8px rgba(55, 48, 163, 0.06);
    box-sizing: border-box;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__group-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6b7280;
    font-weight: 700;
  }

  &__group-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__size {
    font-family: 'Unbounded', sans-serif;
    font-size: 13px;
    font-weight: 900;
    color: #1e1b4b;
    min-width: 36px;
    text-align: center;
  }

  &__btn {
    border-radius: 9px;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s;

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }

    &--icon {
      background: #e8eaf2;
      border: 2px solid #d1d5e8;
      color: #1e1b4b;
      padding: 6px 13px;
      font-size: 20px;
      line-height: 1;

      &:not(:disabled):hover {
        background: #ede9fe;
        border-color: #4f46e5;
        color: #3730a3;
      }
    }

    &--primary {
      background: #3730a3;
      border: 2px solid #3730a3;
      color: #ffffff;
      padding: 10px 18px;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(55, 48, 163, 0.25);
      align-self: flex-end;

      &:hover {
        background: #4f46e5;
        border-color: #4f46e5;
      }
    }
  }

  &__tab {
    background: #e8eaf2;
    border: 2px solid #d1d5e8;
    color: #6b7280;
    border-radius: 9px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s;

    &:hover {
      background: #ede9fe;
      border-color: #4f46e5;
      color: #3730a3;
    }

    &--active {
      background: #3730a3;
      border-color: #3730a3;
      color: #ffffff;
      box-shadow: 0 3px 10px rgba(55, 48, 163, 0.25);

      &:hover {
        background: #4f46e5;
        border-color: #4f46e5;
      }
    }
  }

  &__bonus {
    width: 100%;
    max-width: 520px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fef3c7;
    border: 2px solid #d97706;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    color: #92400e;
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.18);
    box-sizing: border-box;
  }

  &__win {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    background: #ffffff;
    border: 3px solid #059669;
    border-radius: 24px;
    padding: 36px 44px;
    text-align: center;
    box-shadow: 0 0 0 8px #d1fae5, 0 24px 60px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    min-width: 260px;
  }

  &__win-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 38px;
    font-weight: 900;
    color: #059669;
    letter-spacing: 0.04em;
  }

  &__win-stats {
    font-size: 15px;
    color: #4b5563;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__win-record {
    font-size: 14px;
    font-weight: 700;
    color: #d97706;
    background: #fef3c7;
    padding: 6px 16px;
    border-radius: 8px;
    border: 1px solid #fcd34d;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__grid {
    display: grid;
    gap: 7px;
    background: #ffffff;
    padding: 14px;
    border-radius: 20px;
    border: 1px solid #d1d5e8;
    box-shadow: 0 4px 24px rgba(55, 48, 163, 0.07);
    transition: box-shadow 0.4s, border-color 0.4s;
    width: 100%;
    max-width: 520px;
    box-sizing: border-box;

    &--solved {
      border-color: #059669;
      border-width: 2px;
      box-shadow: 0 0 0 4px #d1fae5, 0 8px 32px rgba(5, 150, 105, 0.18);
    }
  }

  &__bar {
    width: 100%;
    max-width: 520px;
    height: 5px;
    background: #e8eaf2;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
  }

  &__bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, #d97706);
    border-radius: 5px;
    transition: width 1s linear;
  }

  &__bar-label {
    font-size: 11px;
    color: #6b7280;
    align-self: flex-end;
    max-width: 520px;
    width: 100%;
    text-align: right;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-leave-active {
  transition: all 0.2s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, -42%);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}

@media (max-width: 480px) {
  .puzzle {
    padding: 12px 10px 32px;
    gap: 12px;

    &__win {
      padding: 28px 22px;
      min-width: 240px;
    }

    &__win-title {
      font-size: 28px;
    }
  }
}
</style>