<template>
  <div class="puzzle" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <div class="puzzle__content">
      <h2 class="puzzle__title">Пятнашки {{ gridSize }}×{{ gridSize }}</h2>

      <div v-if="isWin" class="puzzle__win">ПОБЕДА!</div>

      <div class="puzzle__stats">
        <div class="puzzle__stat">
          <span class="puzzle__stat-label">Ходы:</span>
          <span class="puzzle__stat-value">{{ moves }}</span>
        </div>

        <div class="puzzle__stat">
          <span class="puzzle__stat-label">Время:</span>
          <span class="puzzle__stat-value">{{ formatTimeDisplay }}</span>
        </div>

        <div class="puzzle__stat" v-if="penaltyTime > 0">
          <span class="puzzle__stat-label">Штраф:</span>
          <span class="puzzle__stat-value puzzle__stat-value--penalty">+{{ penaltyTime }}с</span>
        </div>

        <div class="puzzle__stat" v-if="bonusTime > 0">
          <span class="puzzle__stat-label">Бонус:</span>
          <span class="puzzle__stat-value puzzle__stat-value--bonus">-{{ bonusTime }}с</span>
        </div>

        <div class="puzzle__stat" v-if="isFastTimer">
          <span class="puzzle__stat-label">Ускорение:</span>
          <span class="puzzle__stat-value puzzle__stat-value--fast">2x</span>
        </div>

        <div class="puzzle__stat" v-if="recordTime">
          <span class="puzzle__stat-label">Рекорд:</span>
          <span class="puzzle__stat-value puzzle__stat-value--record">{{ recordTimeDisplay }}</span>
        </div>

        <div class="puzzle__stat puzzle__stat--special" v-if="specialMoves > 0">
          <span class="puzzle__stat-label">Спец-ходы:</span>
          <span class="puzzle__stat-value puzzle__stat-value--special">{{ specialMoves }}</span>
        </div>
      </div>

      <div class="puzzle__board" :style="boardStyle">
        <PuzzleTile
            v-for="tile in tileList"
            :key="tile.index"
            :value="tile.value"
            :is-empty="tile.isEmpty"
            :is-win="isWin"
            :is-blocked="tile.isBlocked"
            :is-frozen="tile.isFrozen"
            :tile-style="tileStyle"
            :allow-any-move="specialMoves > 0"
            @click="() => handleTileClick(tile.index)"
        />
      </div>

      <div class="puzzle__controls">
        <button
            class="puzzle__button"
            @click="() => changeSize(-1)"
            :disabled="gridSize <= 3"
        >
          −
        </button>

        <button
            class="puzzle__restart"
            @click="() => restartGame()"
        >
          Перемешать
        </button>

        <button
            class="puzzle__button"
            @click="() => changeSize(1)"
        >
          +
        </button>
      </div>

      <div v-if="specialMoves > 0" class="puzzle__hint">
        💥 Спец-ход доступен! Кликните на любую плитку
      </div>

      <div v-if="isFastTimer" class="puzzle__hint puzzle__hint--fast">
        ⚡ Бездействие! Таймер ускорен
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PuzzleTile from './PuzzleTile.vue'

export default {
  name: 'IndexPage',
  components: {
    PuzzleTile,
  },
  data() {
    return {
      touchStartX: 0,
      touchStartY: 0,
    }
  },
  computed: {
    ...mapGetters('puzzle', [
      'gridSize',
      'moves',
      'timer',
      'specialMoves',
      'isWin',
      'tileList',
      'recordTime',
      'penaltyTime',
      'bonusTime',
      'isFastTimer',
      'displayTime',
    ]),

    boardStyle() {
      return {
        'grid-template-columns': `repeat(${this.gridSize}, 1fr)`,
        'grid-template-rows': `repeat(${this.gridSize}, 1fr)`,
      }
    },

    tileStyle() {
      const baseSize = 80
      const minTileSize = 25
      const size = Math.max(minTileSize, baseSize - (this.gridSize - 4) * 5)
      const fontSize = Math.max(10, 28 - (this.gridSize - 4) * 2)

      return {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${fontSize}px`,
      }
    },

    formatTimeDisplay() {
      const mins = Math.floor(this.displayTime / 60)
      const secs = this.displayTime % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },

    recordTimeDisplay() {
      if (this.recordTime) {
        const mins = Math.floor(this.recordTime / 60)
        const secs = this.recordTime % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return null
    },
  },
  methods: {
    ...mapActions('puzzle', [
      'initGame',
      'shuffleBoard',
      'handleTileClick',
      'changeGridSize',
      'handleSwipe',
      'startTimers',
      'stopTimers',
    ]),

    restartGame() {
      this.initGame()
      setTimeout(() => {
        this.shuffleBoard()
        this.startTimers()
      }, 50)
    },

    changeSize(delta) {
      const newSize = this.gridSize + delta

      if (newSize >= 3) {
        this.changeGridSize(newSize)
        this.restartGame()
      }
    },

    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
    },

    handleTouchEnd(event) {
      const touchEndX = event.changedTouches[0].clientX
      const touchEndY = event.changedTouches[0].clientY
      const diffX = touchEndX - this.touchStartX
      const diffY = touchEndY - this.touchStartY
      const minSwipeDistance = 50

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
          if (diffX > 0) {
            this.handleSwipe('right')
          } else {
            this.handleSwipe('left')
          }
        }
      } else {
        if (Math.abs(diffY) > minSwipeDistance) {
          if (diffY > 0) {
            this.handleSwipe('down')
          } else {
            this.handleSwipe('up')
          }
        }
      }
    },
  },
  mounted() {
    this.restartGame()
  },
  beforeUnmount() {
    this.stopTimers()
  },
}
</script>

<style scoped lang="scss">
.puzzle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  touch-action: none;

  &__content {
    text-align: center;
    width: 100%;
    max-width: 100%;
  }

  &__title {
    color: #fff;
    font-size: 32px;
    margin: 0 0 20px 0;
    font-family: sans-serif;
  }

  &__stats {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  &__stat {
    background: #222;
    padding: 10px 15px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;

    &--special {
      background: #4CAF50;
      animation: pulse 2s infinite;
    }
  }

  &__stat-label {
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
  }

  &__stat-value {
    color: #fff;
    font-size: 20px;
    font-weight: bold;

    &--record {
      color: #FFD700;
    }

    &--special {
      color: #fff;
      font-size: 24px;
    }

    &--penalty {
      color: #ff4444;
    }

    &--bonus {
      color: #4CAF50;
    }

    &--fast {
      color: #ff9800;
      animation: pulse 0.5s infinite;
    }
  }

  &__win {
    color: #4CAF50;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  &__board {
    display: inline-grid;
    gap: 3px;
    margin: 0 auto 30px;
    background-color: #222;
    padding: 3px;
    border-radius: 8px;
    position: relative;
  }

  &__controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  &__restart {
    padding: 12px 40px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-family: sans-serif;
  }

  &__button {
    padding: 12px 20px;
    font-size: 18px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-family: sans-serif;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__hint {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    margin-top: 15px;
    animation: glow 1.5s ease-in-out infinite;

    &--fast {
      background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
  }
}

@media (max-width: 500px) {
  .puzzle {
    padding: 15px;

    &__title {
      font-size: 28px;
    }

    &__stats {
      gap: 10px;
    }

    &__stat {
      padding: 8px 12px;
    }

    &__stat-value {
      font-size: 16px;
    }

    &__restart,
    &__button {
      padding: 10px 30px;
      font-size: 14px;
    }
  }
}

@media (max-width: 350px) {
  .puzzle {
    &__title {
      font-size: 24px;
    }
  }
}
</style>