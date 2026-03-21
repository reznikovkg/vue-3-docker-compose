<template>
  <div class="info-panel">
    <div class="info-panel__next-piece">
      <h3 class="info-panel__heading">Следующая:</h3>
      <div class="info-panel__next-board">
        <div
          v-for="(row, y) in nextPieceBoard"
          :key="y"
          class="info-panel__board-row"
        >
          <div
            v-for="(cell, x) in row"
            :key="x"
            class="info-panel__board-cell"
            :class="{ 'info-panel__board-cell_filled': cell > 0 }"
            :style="cell > 0 ? getCellColor(cell) : {}"
          ></div>
        </div>
      </div>
    </div>

    <div class="info-panel__board-size">
      <h3 class="info-panel__heading">Размер поля</h3>
      <div class="info-panel__board-size-options">
        <label
          v-for="(size, key) in BOARD_SIZES"
          :key="key"
          class="info-panel__board-size-option"
        >
          <input
            type="radio"
            name="boardSize"
            :value="key"
            :checked="boardSize === key"
            :disabled="isSelectDisabled(gameStatus)"
            @change="() => onBoardSizeChanged(key)"
          >
          {{ size.label }}
        </label>
      </div>
    </div>

    <div class="info-panel__hard-mode">
      <label class="info-panel__hard-mode-label">
        <input
          type="checkbox"
          :checked="hardModeEnabled"
          :disabled="isSelectDisabled(gameStatus)"
          @change="(e) => onHardModeToggle(e.target.checked)"
        >
        <span>Сложный режим<br>(стальные фигуры)</span>
      </label>
    </div>

    <div class="info-panel__difficulty">
      <h3 class="info-panel__difficulty__header">Сложность</h3>
      <select
        class="info-panel__difficulty__select"
        :disabled="isSelectDisabled(gameStatus)"
        :value="difficulty"
        @change="(e) => onDifficultyChanged(e.target.value)"
      >
        <option :value="DIFFICULTY.EASY">Легкая</option>
        <option :value="DIFFICULTY.MEDIUM">Средняя</option>
        <option :value="DIFFICULTY.HARD">Сложная</option>
      </select>
    </div>

    <div class="info-panel__lines">
      <h3 class="info-panel__heading">Линий:</h3>
      <div class="info-panel__lines-value">{{ linesCleared }}</div>
    </div>

    <div class="info-panel__game-status">
      <h3 v-if="gameStatus === GAME_STATUS.GAME_OVER" class="info-panel__status-text">
        Игра окончена!
      </h3>
      <h3 v-else-if="gameStatus === GAME_STATUS.PAUSED" class="info-panel__status-text">
        Пауза
      </h3>
      <h3 v-else-if="gameStatus === GAME_STATUS.IDLE" class="info-panel__status-text">
        Готово к игре
      </h3>
      <h3 v-else class="info-panel__status-text">
        Игра идет
      </h3>
    </div>
  </div>
</template>

<script>
import { GAME_STATUS, DIFFICULTY, BOARD_SIZES } from '@/constants/constants'

export default {
  name: 'InfoPanel',
  data () {
    return {
      DIFFICULTY,
      GAME_STATUS,
      BOARD_SIZES
    }
  },
  props: {
    nextPieceBoard: {
      type: Array,
      required: true
    },
    linesCleared: {
      type: Number,
      required: true
    },
    gameStatus: {
      type: GAME_STATUS,
      required: true
    },
    getCellColor: {
      type: Function,
      required: true
    },
    difficulty: {
      type: DIFFICULTY,
      required: true
    },
    boardSize: {
      type: String,
      required: true
    },
    hardModeEnabled: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'difficultyChanged',
    'boardSizeChanged',
    'hardModeToggle'
  ],
  methods: {
    onDifficultyChanged (newDifficulty) {
      this.$emit('difficultyChanged', newDifficulty)
    },
    onBoardSizeChanged (size) {
      this.$emit('boardSizeChanged', size)
    },
    onHardModeToggle (enabled) {
      this.$emit('hardModeToggle', enabled)
    },
    isSelectDisabled (status) {
      return status !== GAME_STATUS.IDLE
          && status !== GAME_STATUS.GAME_OVER
    }
  }
}
</script>

<style scoped lang="scss">
.info-panel {
  &__next-piece {
    text-align: center;
    margin-bottom: 20px;
  }

  &__heading {
    margin: 0 0 10px 0;
    color: #ffffff;
  }

  &__next-board {
    background-color: #000000;
    padding: 10px;
    border-radius: 8px;
    margin-top: 10px;
    display: inline-block
  }

  &__board-row {
    display: flex;
    justify-content: center;
  }

  &__board-cell {
    width: 20px;
    height: 20px;
    border: 1px solid #333333;
    background-color: #000000;
    transition: background-color 0.1s;
  }

  &__board-size {
    margin: 20px 0;
    text-align: center;
  }

  &__board-size-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
  }

  &__board-size-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background-color: #2a2a2a;
    color: #cccccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    input {
      cursor: pointer;
      margin: 0;
    }

    &:hover {
      background-color: #333333;
    }
  }

  &__hard-mode {
    margin: 20px 0;
    padding: 15px;
    background-color: #333333;
    color: #ffffff;
    border-radius: 4px;
  }

  &__hard-mode-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    cursor: pointer;
    font-size: 16px;
    line-height: 1.4;
    white-space: pre-line;
    text-align: center;
  }

  &__difficulty {
    &__header {
      margin: 15px 0;
      text-align: center;
      font-size: 20px;
      color: #ffffff;
    }

    &__select {
      appearance: none;
      width: 100%;
      padding: 10px;
      background-color: #2a2a2a;
      color: #ffffff;
      cursor: pointer;
      text-align: center;

      justify-content: center;

      &:hover {
        border-color: #666;
        background-color: #333;
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }

  &__lines {
    margin: 15px 0;
    text-align: center;
  }

  &__lines-value {
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
  }

  &__game-status {
    text-align: center;
    margin: 20px 0;
    padding: 10px;
    background-color: #333333;
    color: #ffffff;
    border-radius: 4px;
  }

  &__status-text {
    margin: 0;
    font-size: 16px;
  }
}
</style>