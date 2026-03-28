<template>
  <div class="game-page">
    <div class="game-page__header">
      <h2 class="game-page__title">Пятнашки</h2>
      <div class="game-page__header-buttons">
        <CustomButton
            class="game-page__record-button"
            @click="() => goToRecords()"
        >
          <IconRecord/>
          Рекорды
        </CustomButton>
        <div class="game-page__timer">
          <IconTime/>
          {{ formattedTime }}
        </div>
        <CustomButton
            class="game-page__button"
            @click="() => openSettingsModal()"
        >
          Начать заново
        </CustomButton>
        <CustomButton
            class="game-page__button"
            @click="() => goToMenu()"
        >
          Меню
        </CustomButton>
      </div>
    </div>

    <div class="game-page__line"/>

    <div class="game-page__board-wrapper">
      <GameBoard
          ref="gameBoard"
          :special-mode-active="specialModeActive"
          @special-move-complete="() => onSpecialMoveComplete()"
      />

      <div
          v-if="showSpecialMoveButton"
          class="game-page__special-move"
      >
        <CustomButton
            class="game-page__special-button"
            @click="() => activateSpecialMove()"
        >
          <IconLockOpen/>
          Специальный ход готов!
        </CustomButton>
        <div class="game-page__special-hint">
          Кликните на любую клетку, чтобы переместить её на пустое место
        </div>
      </div>

      <div
          v-if="blockedMode && !specialMoveAvailable && isPlaying && !showWinModal && !specialModeActive"
          class="game-page__special-timer"
      >
        <IconLock/>
        Следующий специальный ход через: {{ specialMoveCooldown }} сек
      </div>

      <div
          v-if="showSpecialMoveNotification"
          class="game-page__notification"
      >
        Специальный ход активирован! Кликните на любую клетку.
      </div>
    </div>

    <SettingsModal
        v-show="isSettingsModalVisible"
        :blocked-mode="blockedMode"
        @close="() => closeSettingsModal()"
        @play="(sizeData) => restartGame(sizeData)"
    />

    <WinModal v-show="showWinModal"/>
  </div>
</template>

<script>
import CustomButton from '@/components/ui/CustomButton.vue'
import {mapActions, mapGetters} from 'vuex'
import {ROUTES} from "@/router/index.js"
import GameBoard from "@/components/ui/GameBoard.vue"
import SettingsModal from "@/components/modals/SettingsModal.vue"
import WinModal from "@/components/modals/WinModal.vue"
import IconRecord from "@/components/icons/IconRecord.vue"
import IconTime from "@/components/icons/IconTime.vue"
import IconLock from "@/components/icons/IconLock.vue"
import IconLockOpen from "@/components/icons/IconLockOpen.vue"

export default {
  name: 'TagGamePage',
  components: {
    IconLockOpen,
    IconLock,
    IconTime,
    IconRecord,
    WinModal,
    SettingsModal,
    GameBoard,
    CustomButton
  },
  data() {
    return {
      isSettingsModalVisible: false,
      timerInterval: null,
      cooldownInterval: null,
      cooldownSeconds: 60,
      showSpecialMoveNotification: false,
      notificationTimeout: null,
      specialModeActive: false
    }
  },
  computed: {
    ...mapGetters({
      showWinModal: 'getShowWinModal',
      gameTime: 'getGameTime',
      formattedTime: 'getFormattedTime',
      specialMoveAvailable: 'getSpecialMoveAvailable',
      blockedMode: 'getBlockedMode',
      isPlaying: 'getIsPlaying'
    }),
    showSpecialMoveButton() {
      return this.blockedMode && this.specialMoveAvailable && this.isPlaying && !this.showWinModal && !this.specialModeActive
    },
    specialMoveCooldown() {
      return this.cooldownSeconds
    }
  },
  created() {
    this.initializeGame()
    if (this.blockedMode) {
      this.startSpecialMoveAccumulator()
    }
  },
  beforeUnmount() {
    this.stopAllIntervals()
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout)
    }
  },
  methods: {
    ...mapActions([
      'initGame',
      'resetGame',
      'updateGameSize',
      'setBlockedMode',
      'stopTimer',
      'consumeSpecialMove'
    ]),
    initializeGame() {
      this.initGame()
    },
    openSettingsModal() {
      this.isSettingsModalVisible = true
    },
    closeSettingsModal() {
      this.isSettingsModalVisible = false
    },
    restartGame(sizeData) {
      this.updateGameSize({
        width: sizeData.width,
        height: sizeData.height
      })
      this.setBlockedMode(sizeData.blockedMode)
      this.initGame()
      this.closeSettingsModal()
      this.specialModeActive = false

      this.stopAllIntervals()

      if (sizeData.blockedMode) {
        this.startSpecialMoveAccumulator()
      }
    },
    goToMenu() {
      this.stopTimer()
      this.stopAllIntervals()
      this.$router.push({name: ROUTES.INDEX})
    },
    goToRecords() {
      this.stopTimer()
      this.stopAllIntervals()
      this.$router.push({name: ROUTES.RECORDS})
    },
    startSpecialMoveAccumulator() {
      this.cooldownSeconds = 60

      this.cooldownInterval = setInterval(() => {
        if (!this.showWinModal && this.isPlaying && this.blockedMode && !this.specialModeActive) {
          if (this.cooldownSeconds > 0) {
            this.cooldownSeconds--
          }

          if (this.cooldownSeconds === 0 && !this.specialMoveAvailable) {
            this.$store.dispatch('accumulateSpecialMove')
            this.cooldownSeconds = 60
          }
        }
      }, 1000)
    },
    stopAllIntervals() {
      if (this.cooldownInterval) {
        clearInterval(this.cooldownInterval)
        this.cooldownInterval = null
      }
    },
    activateSpecialMove() {
      this.specialModeActive = true
      this.showSpecialMoveNotification = true

      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout)
      }

      this.notificationTimeout = setTimeout(() => {
        this.showSpecialMoveNotification = false
      }, 3000)

      setTimeout(() => {
        if (this.specialModeActive) {
          this.deactivateSpecialMove()
        }
      }, 5000)
    },
    deactivateSpecialMove() {
      this.specialModeActive = false
    },
    onSpecialMoveComplete() {
      this.consumeSpecialMove()
      this.deactivateSpecialMove()
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.game-page {
  &__header {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    align-items: center;
    width: 100%;
    flex-wrap: wrap;
    gap: 20px;

    @media (max-width: 480px) {
      margin-bottom: 10px;
    }
  }

  &__title {
    color: $purpleDark;
    font-size: 70px;
    font-weight: 700;

    @media (max-width: 480px) {
      font-size: 20px;
    }
  }

  &__header-buttons {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  &__timer {
    background: $purpleBg;
    border-radius: 60px;
    padding: 8px 20px;
    font-size: 24px;
    font-weight: 700;
    color: $purpleDark;
    border: 2px solid $purpleBorder;
    box-shadow: 0 4px 0 $purpleShadow;
    white-space: nowrap;

    @media (max-width: 480px) {
      font-size: 16px;
      padding: 4px 12px;
    }
  }

  &__record-button {
    padding: 8px 16px;
    font-size: 24px;
    margin: 0;
    background: $purplePrimary;

    @media (max-width: 480px) {
      font-size: 14px;
      padding: 4px 12px;
    }
  }

  &__button {
    padding: 8px 16px;
    font-size: 24px;
    margin: 0;

    @media (max-width: 480px) {
      font-size: 14px;
      padding: 4px 12px;
    }
  }

  &__line {
    @include gradientLine;
    height: 3px;
    width: 80%;
    max-width: 1000px;
    margin: 0 auto;
  }

  &__board-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-top: 50px;
    position: relative;
  }

  &__special-move {
    margin-top: 20px;
    text-align: center;
  }

  &__special-button {
    padding: 12px 24px;
    font-size: 28px;
    background: linear-gradient(135deg, $purplePrimary, $purpleMedium);
    animation: pulse 2s infinite;
    margin-bottom: 10px;

    @media (max-width: 480px) {
      font-size: 20px;
      padding: 8px 16px;
    }
  }

  &__special-hint {
    font-size: 18px;
    color: $purpleDark;
    margin-top: 10px;
    font-weight: 600;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  &__special-timer {
    font-size: 18px;
    color: $purpleDarker;
    margin-top: 10px;
    font-weight: 500;
    text-align: center;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  &__notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, $purplePrimary, $purpleMedium);
    color: white;
    padding: 15px 30px;
    border-radius: 60px;
    font-size: 18px;
    font-weight: 600;
    z-index: 1000;
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    white-space: nowrap;

    @media (max-width: 480px) {
      font-size: 14px;
      padding: 10px 20px;
      white-space: normal;
      text-align: center;
      width: 80%;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 0 $purpleShadow, 0 8px 16px $shadowColor;
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 0 $purpleShadow, 0 12px 24px $shadowColorActive;
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 0 $purpleShadow, 0 8px 16px $shadowColor;
  }
}

@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
</style>
