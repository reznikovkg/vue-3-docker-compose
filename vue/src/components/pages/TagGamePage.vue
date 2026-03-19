<template>
  <div class="head">
    <h2 class="header">Пятнашки</h2>
    <div class="buttons">
      <CustomButton
          class="headButton"
          @click="() => openSettingsModal()">Начать заново
      </CustomButton>
      <CustomButton
          class="headButton"
          @click="() => goToMenu()">Меню
      </CustomButton>
    </div>
  </div>
  <div class="line"/>

  <div class="gameWrapper">
    <GameBoard/>
  </div>

  <SettingsModal
      v-show="isSettingsModalVisible"
      @close="closeSettingsModal"
      @play="restartGame"
  />

  <WinModal v-show="showWinModal"/>
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
    ...mapActions({
      initGame: 'initGame',
      resetGame: 'resetGame',
      updateGameSize: 'updateGameSize'
    }),
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
          .then(() => {
            this.initGame()
            this.closeSettingsModal()
          })
    },
    goToMenu() {
      this.$router.push({name: ROUTES.INDEX})
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.head {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  align-items: center;
  width: 100%;

  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
}

.header {
  color: $purpleDark;
  font-size: 70px;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 20px;
  }
}

.buttons {
  display: flex;
  gap: 20px;
  margin-left: 500px;

  @media (max-width: 480px) {
    margin-left: 15px;
  }
}

.headButton {
  padding: 8px 16px;
  font-size: 24px;
  margin: 0;

  :deep(.c-button) {
    @media (max-width: 480px) {
      font-size: 15px;
    }
  }
}

.line {
  @include gradientLine;
  height: 3px;
  width: 80%;
  max-width: 1000px;
  margin: 0 auto;
}

.gameWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 50px;
}
</style>
