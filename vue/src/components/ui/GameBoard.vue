<template>
  <div
      class="game-board"
      :style="boardStyle"
  >
    <button
        v-for="(value, index) in gameBoard"
        :key="index"
        class="game-board__tile"
        :class="{
        'game-board__tile--empty': value === 0,
        'game-board__tile--blocked': isBlocked(index),
        'game-board__tile--special-mode': specialModeActive
      }"
        @click="() => handleTileClick(index)"
    >
      {{ value === 0 ? '' : value }}
    </button>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

export default {
  name: 'GameBoard',
  props: {
    specialModeActive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters({
      gameBoard: 'getGameBoard',
      gameWidth: 'getGameWidth',
      gameHeight: 'getGameHeight',
      blockedCells: 'getBlockedCells',
      blockedMode: 'getBlockedMode'
    }),
    boardStyle() {
      return {
        gridTemplateColumns: `repeat(${this.gameWidth}, 85px)`
      }
    }
  },
  methods: {
    ...mapActions([
      'moveTile',
      'consumeSpecialMove'
    ]),
    isBlocked(index) {
      return this.blockedCells && this.blockedCells.includes(index)
    },
    handleTileClick(index) {
      if (this.specialModeActive && this.blockedMode) {
        this.executeSpecialMove(index)
      } else {
        this.moveTile(index)
      }
    },
    executeSpecialMove(index) {
      const board = [...this.gameBoard]
      const zeroIndex = board.indexOf(0)
      const tileValue = board[index]

      if (tileValue !== 0) {
        [board[index], board[zeroIndex]] = [board[zeroIndex], board[index]]
        this.$store.commit('SET_GAME_BOARD', board)

        this.$emit('special-move-complete')

        if (this.blockedMode) {
          this.$store.dispatch('updateBlockedCells')
        }

        const width = this.gameWidth
        const height = this.gameHeight
        const total = width * height
        const isWin = board.every((value, idx) =>
            idx === total - 1 ? value === 0 : value === idx + 1
        )

        if (isWin) {
          this.$store.dispatch('stopTimer')
          this.$store.dispatch('saveRecord')
          this.$store.dispatch('showWinModal')
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.game-board {
  display: grid;
  gap: 12px;
  background: $boardBg;
  padding: 20px;
  border-radius: 30px;

  &__tile {
    @include tileBase;
    @include tileShadow;
    transition: all 0.2s ease;

    &--empty {
      background: $tileEmptyBg;
      box-shadow: inset 0 0 0 2px $tileEmptyBorder, 0 4px 0 $tileEmptyShadow;
      color: transparent;

      &::after {
        content: '○';
        font-size: 32px;
        color: $tileEmptySymbol;
      }
    }

    &--blocked {
      background: $tileEmptyBg;
      cursor: not-allowed;
      opacity: 0.7;

      &::after {
        content: '🔒';
        font-size: 24px;
        color: $tileEmptySymbol;
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 4px 0 $tileShadow, 0 12px 24px $shadowColor;
      }
    }

    &--special-mode {
      background: linear-gradient(135deg, $tileBg, $purplePrimary);
      animation: specialPulse 0.5s ease-in-out;
      cursor: pointer;
      transform: scale(1.05);

      &:hover {
        transform: scale(1.08);
      }
    }

    &:active {
      transform: translateY(4px);
      box-shadow: 0 0 0 $tileShadow, 0 4px 12px $shadowColorActive;
    }
  }
}

@keyframes specialPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 0 $tileShadow, 0 12px 24px $shadowColor;
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 0 $tileShadow, 0 16px 32px $shadowColorActive;
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 0 $tileShadow, 0 12px 24px $shadowColor;
  }
}
</style>
