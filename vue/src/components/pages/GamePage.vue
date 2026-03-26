<template>
  <div class="game-wrapper">
    <div class="game-wrapper__top">
      <h1 class="game-wrapper__name">Числовое слияние</h1>
      <p class="game-wrapper__points">
        Очки: <b>{{ scrore }}</b>
      </p>
    </div>

    <div class="game-wrapper__btns">
      <button
        class="btn btn--green"
        :disabled="draging"
        @click="spawnNumber"
      >
        + Число
      </button>
      <button
        class="btn btn--danger"
        @click="restartGame"
      >
        Сбросить
      </button>
    </div>

    <div
      class="game-wrapper__field"
      :style="{ 'grid-template-columns': `repeat(${grdiSize}, 1fr)` }"
      @dragover.prevent
      @drop="onFieldDrop"
    >
      <CellItem
        v-for="(cell, i) in cells"
        :key="i"
        :data="cell"
        :idx="i"
        :is-drag="draging"
        @start-drag="onStartDrag"
        @stop-drag="onStopDrag"
        @cell-drop="onCellDrop"
        @cell-touch-move="onCellTouchMove"
        @cell-touch-end="onCellTouchEnd"
      />
    </div>
  </div>
</template>

<script>
import CellItem from '../ui/CellItem.vue'

const FIELD_SIZE = 8
const SAVE_KEY = 'number-merge-save'
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8]
const POINTS_TABLE = [10, 25, 50, 100, 200, 400, 800, 1600]

export default {
  name: 'GamePage',
  components: { CellItem },

  data() {
    return {
      cells: [],
      scrore: 0,
      draging: false,
      dragItem: null,
      dragFromIdx: null,
      touchStart: null,
      grdiSize: FIELD_SIZE,
    }
  },

  created() {
    this.tryLoadSave()
  },

  methods: {
    tryLoadSave() {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) {
        this.createField()
        return
      }
      try {
        const parsed = JSON.parse(raw)
        this.cells = parsed.cells
        this.scrore = parsed.scrore
      } catch {
        this.createField()
      }
    },

    persistState() {
      const data = { cells: this.cells, scrore: this.scrore }
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    },

    createField() {
      this.cells = new Array(this.grdiSize * this.grdiSize).fill(null)
      this.scrore = 0
      for (let k = 0; k < 8; k++) {
        this.spawnNumber()
      }
      this.persistState()
    },

    restartGame() {
      if (!confirm('Точно хочешь начать заново?')) return
      this.createField()
    },

    spawnNumber() {
      if (this.draging) return

      const free = []
      this.cells.forEach((c, i) => {
        if (c === null) free.push(i)
      })

      if (free.length === 0) {
        alert('Поле заполнено!')
        return
      }

      const pos = free[Math.floor(Math.random() * free.length)]
      const lvl = Math.floor(Math.random() * 3)

      this.cells[pos] = {
        tier: lvl,
        val: NUMBERS[lvl],
      }
      this.persistState()
    },

    onStartDrag(data, idx) {
      if (!data) return
      this.draging = true
      this.dragItem = data
      this.dragFromIdx = idx
    },

    onStopDrag() {
      this.draging = false
      this.dragItem = null
      this.dragFromIdx = null
      this.touchStart = null
    },

    onCellDrop(targetIdx) {
      if (!this.dragItem || this.dragFromIdx === targetIdx) {
        this.onStopDrag()
        return
      }
      this.tryMerge(this.dragFromIdx, targetIdx)
      this.onStopDrag()
    },

    onFieldDrop() {
      this.onStopDrag()
    },

    onCellTouchMove(evt, idx) {
      if (!this.touchStart) {
        this.touchStart = { index: idx, data: this.cells[idx] }
      }
    },

    onCellTouchEnd(evt, targetIdx) {
      if (!this.touchStart || !this.touchStart.data) {
        this.touchStart = null
        return
      }
      if (this.touchStart.index !== targetIdx) {
        this.tryMerge(this.touchStart.index, targetIdx)
      }
      this.touchStart = null
    },

    tryMerge(from, to) {
      const itemFrom = this.cells[from]
      const itemTo = this.cells[to]

      if (!itemFrom) return

      if (!itemTo) {
        this.cells[to] = itemFrom
        this.cells[from] = null
        this.persistState()
        return
      }

      if (itemFrom.tier === itemTo.tier) {
        const nextTier = Math.min(itemFrom.tier + 1, NUMBERS.length - 1)
        this.scrore += POINTS_TABLE[nextTier]

        this.cells[to] = {
          tier: nextTier,
          val: NUMBERS[nextTier],
        }
        this.cells[from] = null
      } else {
        var tmp = this.cells[from]
        this.cells[from] = this.cells[to]
        this.cells[to] = tmp
      }

      this.persistState()
    },
  },
}
</script>

<style lang="scss">
.game-wrapper {
  max-width: 750px;
  margin: 10px auto;
  padding: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 18px;
    background: #16213e;
    border-radius: 12px;
    color: #e0e0e0;
    border: 1px solid #2a2a4a;
  }

  &__name {
    margin: 0;
    font-size: 22px;
    letter-spacing: 0.5px;
  }

  &__points {
    margin: 0;
    font-size: 18px;

    b {
      color: #f7d354;
      font-size: 22px;
    }
  }

  &__btns {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__field {
    display: grid;
    gap: 5px;
    background: #0f3460;
    padding: 8px;
    border-radius: 12px;
    min-height: 380px;
    border: 1px solid #1a4a7a;
  }
}
</style>
