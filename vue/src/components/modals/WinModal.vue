<template>
  <div class="modalOverlay" @click="() => closeModal()">
    <div class="container" @click.stop>
      <div class="title">
        Победа!
      </div>
      <div class="line"/>
      <div class="textContainer">
        <div class="text">Вы собрали пятнашки!</div>
      </div>

      <div class="buttonWrapper">
        <CustomButton
            class="winButton"
            @click="() => playAgain()"
        >
          Начать заново
        </CustomButton>
        <CustomButton
            class="winButton"
            @click="() => goToMenu()"
        >
          Меню
        </CustomButton>
      </div>
    </div>
  </div>
</template>

<script>
import CustomButton from '@/components/ui/CustomButton.vue'
import {mapActions} from 'vuex'
import {ROUTES} from "@/router/index.js"

export default {
  name: 'WinModal',
  components: {
    CustomButton
  },
  methods: {
    ...mapActions({
      hideWinModal: 'hideWinModal',
      resetGame: 'resetGame'
    }),
    closeModal() {
      this.hideWinModal()
    },
    playAgain() {
      this.hideWinModal()
      this.resetGame()
    },
    goToMenu() {
      this.hideWinModal()
      this.$router.push({name: ROUTES.INDEX})
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.container {
  width: 400px;
  color: $purpleText;
  border: 4px solid $purpleBorder;
  border-radius: 60px;
  display: flex;
  flex-direction: column;
  background: $purpleBg;
  padding-bottom: 30px;
}

.title {
  text-align: center;
  font-size: 40px;
  font-weight: 600;
  color: $purpleDark;
  margin: 10px;
}

.line {
  @include gradientLine;
  height: 3px;
  width: 80%;
  max-width: 1000px;
  margin: 0 auto;
}

.textContainer {
  width: 100%;
  margin: 20px auto;
  padding: 0 30px;
  box-sizing: border-box;
  word-wrap: break-word;
  text-align: center;
}

.text {
  font-size: 25px;
  color: $purpleDarker;
  margin: 10px 0;
}

.buttonWrapper {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.winButton {
  padding: 8px 16px;
  font-size: 20px;
  margin: 0;
}
</style>
