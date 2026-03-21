<template>
  <div class="controls">
    <div class="controls__row">
      <button
        :disabled="gameStatus !== GAME_STATUS.PLAYING"
        class="controls__btn"
        @click="() => actions.movePieceLeft()"
      >
        {{ CONTROLS.LEFT }}
      </button>
      <button
        :disabled="gameStatus !== GAME_STATUS.PLAYING"
        class="controls__btn"
        @click="() => actions.movePieceRight()"
      >
        {{ CONTROLS.RIGHT }}
      </button>
    </div>
    <div class="controls__row">
      <button
        :disabled="gameStatus !== GAME_STATUS.PLAYING"
        class="controls__btn"
        @click="() => actions.rotateCurrentPiece()"
      >
        {{ CONTROLS.ROTATE }}
      </button>
      <button
        :disabled="gameStatus !== GAME_STATUS.PLAYING"
        class="controls__btn"
        @click="() => actions.hardDropPiece()"
      >
        {{ CONTROLS.DROP }}
      </button>
    </div>
    <div class="controls__row">
      <button
        class="controls__btn controls__btn_pause"
        @click="() => actions.toggleGamePause()"
      >
        {{ gameStatus === GAME_STATUS.PLAYING ? CONTROLS.PAUSE : CONTROLS.PLAY }}
      </button>
      <button
        class="controls__btn controls__btn_reset"
        @click="() => actions.resetGame()"
      >
        {{ CONTROLS.RESET }}
      </button>
    </div>
  </div>
</template>

<script>
import { CONTROLS, GAME_STATUS } from '../../constants/constants'

export default {
  name: 'Controls',
  data () {
    return {
      CONTROLS,
      GAME_STATUS
    }
  },
  props: {
    gameStatus: {
      type: String
    },
    actions: {
      type: Object
    }
  }
}
</script>

<style scoped lang="scss">
.controls {

  &__row {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 10px 0;
  }

  &__btn {
    width: 60px;
    height: 60px;
    font-size: 24px;
    border: none;
    border-radius: 8px;
    background-color: #444444;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    &:hover:not(:disabled) {
      background-color: #666666;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    &_pause,
    &_reset {
      background-color: #444444;
    }
  }
}
</style>