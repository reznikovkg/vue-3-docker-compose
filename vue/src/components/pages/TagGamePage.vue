<template>
  <div class="game-page">
    <div class="game-page__header">
      <h2 class="game-page__title">Пятнашки</h2>
      <div class="game-page__buttons">
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
      <GameBoard/>
    </div>

    <SettingsModal
        v-show="isSettingsModalVisible"
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
import GameBoard from "@/components/ui/GameBoard.vue";
import SettingsModal from "@/components/modals/SettingsModal.vue";
import WinModal from "@/components/modals/WinModal.vue";

export default {
  name: 'TagGamePage',
  components: {
    WinModal,
    SettingsModal,
    GameBoard,
    CustomButton
  },
  data() {
    return {
      isSettingsModalVisible: false
    }
  },
  computed: {
    ...mapGetters({
      showWinModal: 'getShowWinModal'
    })
  },
  created() {
    this.initializeGame()
  },
  methods: {
    ...mapActions([
      'initGame',
      'resetGame',
      'updateGameSize'
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
      this.updateGameSize(sizeData)
      this.initGame()
      this.closeSettingsModal()
    },
    goToMenu() {
      this.$router.push({name: ROUTES.INDEX})
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

  &__buttons {
    display: flex;
    gap: 20px;
    margin-left: 500px;

    @media (max-width: 480px) {
      margin-left: 15px;
    }
  }

  &__button {
    padding: 8px 16px;
    font-size: 24px;
    margin: 0;

    :deep(.c-button) {
      @media (max-width: 480px) {
        font-size: 15px;
      }
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
  }
}
</style>
