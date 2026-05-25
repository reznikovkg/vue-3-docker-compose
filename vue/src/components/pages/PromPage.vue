<template>
  <div class="prom">
    <div class="prom__panel">
      <div class="prom__heading">
        <h1 class="prom__title">Остров</h1>
        <p class="prom__hint">
          Стрелки перемещают остров. `Q` повернуть влево, `E` повернуть вправо.
        </p>
      </div>

      <div class="prom__stats">
        <div class="prom__stat">
          <span class="prom__stat-label">Статус</span>
          <strong class="prom__stat-value">{{ statusLabel }}</strong>
        </div>

        <div class="prom__stat">
          <span class="prom__stat-label">Очки</span>
          <strong class="prom__stat-value">{{ getScore }}</strong>
        </div>

        <div class="prom__stat">
          <span class="prom__stat-label">Лучший</span>
          <strong class="prom__stat-value">{{ getBestScore }}</strong>
        </div>

        <div class="prom__stat">
          <span class="prom__stat-label">Время</span>
          <strong class="prom__stat-value">{{ getTimeLeft }}сек</strong>
        </div>
      </div>

      <div class="prom__controls">
        <label class="prom__label">
          <span class="prom__label-text">Размер поля</span>
          <input
            v-model.number="fieldSizeInput"
            class="prom__input"
            type="number"
            min="5"
            step="2"
          >
        </label>

        <div class="prom__actions">
          <button class="prom__button" type="button" @click="() => restartPromGame()">
            Заново
          </button>

          <button
            class="prom__button prom__button--accent"
            type="button"
            :disabled="!canBoost"
            @click="() => boostFigure()"
          >
            Ускорить фигуру
          </button>
        </div>
      </div>
    </div>

    <div class="prom__board">
      <div class="prom__field" :style="fieldStyles">
        <template v-for="row in fieldRange" :key="`row-${row}`">
          <div
            v-for="col in fieldRange"
            :key="`${row}-${col}`"
            class="prom__cell"
            :class="getCellClasses(col, row)"
          />
        </template>
      </div>

      <div v-if="getStatus === 'game-over'" class="prom__overlay">
        <strong>Game Over</strong>
        <span>Вы коснулись стены или кончилось время.</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'

type Cell = {
  x: number
  y: number
}

type Direction = 'up' | 'right' | 'down' | 'left'
type RotationDirection = 'cw' | 'ccw'

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left'
}

const ROTATION_KEYS: Record<string, RotationDirection> = {
  q: 'ccw',
  Q: 'ccw',
  e: 'cw',
  E: 'cw'
}

export default {
  name: 'PromPage',
  data () {
    return {
      fieldSizeInput: 11
    }
  },
  computed: {
    ...mapGetters('island', [
      'getFieldSize',
      'getBaseCell',
      'getIslandCells',
      'getActiveFigure',
      'getActiveFigureCells',
      'getScore',
      'getBestScore',
      'getTimeLeft',
      'getStatus'
    ]),

    statusLabel (): string {
      if (this.getStatus === 'running') {
        return 'Running'
      }

      if (this.getStatus === 'game-over') {
        return 'Game Over'
      }

      return 'Idle'
    },

    fieldRange (): number[] {
      const size = Number(this.getFieldSize) || 0

      return Array.from({ length: size }, (_, index) => index)
    },

    fieldStyles (): Record<string, string> {
      const size = Number(this.getFieldSize) || 0

      return {
        gridTemplateColumns: `repeat(${size}, var(--cell-size))`,
        gridTemplateRows: `repeat(${size}, var(--cell-size))`
      }
    },

    islandCellKeys (): Set<string> {
      return new Set(
        (this.getIslandCells as Cell[]).map((cell: Cell) => `${cell.x}:${cell.y}`)
      )
    },

    activeFigureCellKeys (): Set<string> {
      return new Set(
        (this.getActiveFigureCells as Cell[]).map((cell: Cell) => `${cell.x}:${cell.y}`)
      )
    },

    canBoost (): boolean {
      return this.getStatus === 'running' && Boolean(this.getActiveFigure)
    }
  },

  mounted () {
    this.startPromGame()
    window.addEventListener('keydown', this.handleKeydown)
  },

  beforeUnmount () {
    window.removeEventListener('keydown', this.handleKeydown)
    this.stopGame()
  },

  methods: {
    ...mapActions('island', [
      'startGame',
      'restartGame',
      'stopGame',
      'moveIsland',
      'rotateIsland',
      'boostFigure'
    ]),

    startPromGame () {
      this.startGame(this.fieldSizeInput)
      this.fieldSizeInput = this.getFieldSize
    },

    restartPromGame () {
      this.restartGame(this.fieldSizeInput)
      this.fieldSizeInput = this.getFieldSize
    },

    handleKeydown (event: KeyboardEvent) {
      if (event.repeat || this.getStatus !== 'running') {
        return
      }

      const target = event.target as HTMLElement | null

      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return
      }

      const direction = KEY_DIRECTIONS[event.key]

      if (direction) {
        event.preventDefault()
        this.moveIsland(direction)
        return
      }

      const rotation = ROTATION_KEYS[event.key]

      if (!rotation) {
        return
      }

      event.preventDefault()
      this.rotateIsland(rotation)
    },

    isIslandCell (x: number, y: number) {
      return this.islandCellKeys.has(`${x}:${y}`)
    },

    isFigureCell (x: number, y: number) {
      return this.activeFigureCellKeys.has(`${x}:${y}`)
    },

    isBaseCell (x: number, y: number) {
      if (!this.getBaseCell) {
        return false
      }

      return this.getBaseCell.x === x && this.getBaseCell.y === y
    },

    getCellClasses (x: number, y: number) {
      return {
        'prom__cell--figure': this.isFigureCell(x, y),
        'prom__cell--island': this.isIslandCell(x, y),
        'prom__cell--base': this.isBaseCell(x, y)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.prom {
  --cell-size: 32px;

  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 24px;
  align-items: start;

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 32px;
    line-height: 1;
  }

  &__hint {
    color: rgba(235, 235, 235, 0.72);
    max-width: 28ch;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.04);
  }

  &__stat-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(235, 235, 235, 0.64);
  }

  &__stat-value {
    font-size: 22px;
    line-height: 1;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label-text {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(235, 235, 235, 0.64);
  }

  &__input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.06);
    color: inherit;
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__button {
    border: 1px solid #d7dde3;
    background: transparent;
    color: inherit;
    padding: 10px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover:enabled {
      background: rgba(255, 255, 255, 0.08);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    &--accent {
      border-color: #00b877;
      background: #00d389;
      color: #072014;

      &:hover:enabled {
        background: #0be59a;
      }
    }
  }

  &__board {
    position: relative;
    width: max-content;
    max-width: 100%;
    overflow: auto;
    padding: 12px;
    border: 1px solid var(--color-border);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
      #0e1620;
  }

  &__field {
    display: grid;
    gap: 2px;
    width: max-content;
  }

  &__cell {
    width: var(--cell-size);
    height: var(--cell-size);
    border: 1px solid rgba(207, 214, 221, 0.16);
    background: rgba(255, 255, 255, 0.04);

    &--figure {
      background: #ff9b3d;
      border-color: #ff7a00;
    }

    &--island {
      background: #00d389;
      border-color: #00b877;
    }

    &--base {
      background: #009dff;
      border-color: #007ed0;
    }
  }

  &__overlay {
    position: absolute;
    inset: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    background: rgba(7, 15, 23, 0.8);
    text-align: center;
    backdrop-filter: blur(4px);
  }
}

@media (max-width: 960px) {
  .prom {
    --cell-size: 28px;

    grid-template-columns: 1fr;
  }
}
</style>
