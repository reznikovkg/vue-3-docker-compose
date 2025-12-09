<template>
  <div class="tetris">
    <!-- Мобильный header с кнопками -->
    <div class="mobile-header">
      <button class="mobile-header__btn mobile-header__btn--back" @click="handleQuit">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <div class="mobile-stats">
        <div class="mobile-stats__item">
          <span class="mobile-stats__label">Уровень</span>
          <span class="mobile-stats__value">{{ gameStats.level }}</span>
        </div>
        <div class="mobile-stats__item">
          <span class="mobile-stats__label">До уровня</span>
          <span class="mobile-stats__value">{{ linesToLevel }}</span>
        </div>
        <div class="mobile-stats__item">
          <span class="mobile-stats__label">Очки</span>
          <span class="mobile-stats__value">{{ gameStats.points }}</span>
        </div>
      </div>
      
      <button class="mobile-header__btn mobile-header__btn--pause" @click="handlePause">
        <svg v-if="!isPaused" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>

    <!-- Превью фигур для мобильных -->
    <div class="mobile-previews">
      <div 
        v-for="(tetromino, index) in previewTetrominoes" 
        :key="index"
        class="mobile-preview"
      >
        <div class="mobile-preview__board">
          <template v-for="(row, y) in getTetriminoBoard(tetromino).rows" :key="y">
            <BoardCell 
              v-for="(cell, x) in row" 
              :key="`${x}-${y}`"
              :cell="cell" 
            />
          </template>
        </div>
      </div>
    </div>

    <Board />
    
    <div class="sidebar">
      <GameStats />
      <Previews />
    </div>
    
    <GameController />
    <TouchControls />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Board from './Board.vue'
import BoardCell from './BoardCell.vue'
import GameStats from './GameStats.vue'
import Previews from './Previews.vue'
import GameController from './GameController.vue'
import TouchControls from './TouchControls.vue'
import { buildBoard } from '../business/Board.js'
import { transferToBoard } from '../business/Tetrominoes.js'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})

const store = useStore()

const gameStats = computed(() => store.getters['game/gameStats'])
const linesToLevel = computed(() => store.getters['game/linesToLevel'])
const isPaused = computed(() => store.getters['game/isPaused'])
const tetrominoes = computed(() => store.getters['player/tetrominoes'])

const previewTetrominoes = computed(() => 
  tetrominoes.value
    .slice(1 - tetrominoes.value.length)
    .reverse()
    .slice(0, 3)
)

const getTetriminoBoard = (tetromino) => {
  const { shape, className } = tetromino
  const board = buildBoard({ rows: 4, columns: 4 })
  
  board.rows = transferToBoard({
    className,
    isOccupied: false,
    position: { row: 0, column: 0 },
    rows: board.rows,
    shape,
  })
  
  return board
}

const handlePause = () => {
  store.dispatch('game/togglePause')
}

const handleQuit = () => {
  store.dispatch('game/setGameOver', true)
}
</script>

<style lang="scss" scoped>
.tetris {
  position: relative;
  display: grid;
  grid-template-areas: "board sidebar";
  grid-template-columns: auto minmax(200px, 300px);
  grid-template-rows: 1fr;
  gap: 30px;
  justify-content: center;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  overflow: hidden;
}

.sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Мобильные элементы - скрыты на десктопе */
.mobile-header,
.mobile-previews {
  display: none;
}

@media (max-width: 768px) {
  .tetris {
    grid-template-areas:
      "header"
      "previews"
      "board";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    gap: 10px;
    padding: 10px;
    padding-bottom: 140px;
    max-height: 100vh;
    max-height: 100dvh;
    overflow: hidden;
  }

  /* Скрываем обычный sidebar на мобильных */
  .sidebar {
    display: none;
  }

  /* Показываем мобильный header */
  .mobile-header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 8px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &__btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 8px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;

      &:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.3);
      }

      svg {
        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
      }
    }
  }

  .mobile-stats {
    display: flex;
    gap: 8px;
    flex: 1;
    justify-content: space-around;
    min-width: 0;

    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 0;
    }

    &__label {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.8);
      white-space: nowrap;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    &__value {
      font-size: 1.2rem;
      font-weight: bold;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      line-height: 1;
    }
  }

  /* Показываем мобильные превью */
  .mobile-previews {
    grid-area: previews;
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .mobile-preview {
    flex: 0 0 auto;

    &__board {
      display: grid;
      grid-gap: 1px;
      grid-template-rows: repeat(4, 1fr);
      grid-template-columns: repeat(4, 1fr);
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 4px;
    }
  }
}

@media (max-width: 480px) {
  .tetris {
    padding: 5px;
    padding-bottom: 150px;
    gap: 8px;
  }

  .mobile-header {
    padding: 6px 10px;

    &__btn {
      width: 36px;
      height: 36px;

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .mobile-stats {
    gap: 4px;

    &__label {
      font-size: 0.65rem;
    }

    &__value {
      font-size: 1.1rem;
    }
  }

  .mobile-preview {
    &__board {
      width: 50px;
      height: 50px;
    }
  }
}
</style>