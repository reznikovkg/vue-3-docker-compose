<template>
  <div class="win-modal" @click="() => closeModal()">
    <div class="win-modal__container" @click.stop>
      <div class="win-modal__title">
        Победа!
      </div>

      <div class="win-modal__line"/>

      <div class="win-modal__content">
        <div class="win-modal__text">
          Вы собрали пятнашки!
        </div>
      </div>

      <div class="win-modal__footer">
        <CustomButton
            class="win-modal__button"
            @click="() => playAgain()"
        >
          Начать заново
        </CustomButton>
        <CustomButton
            class="win-modal__button"
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
    ...mapActions([
      'hideWinModal',
      'resetGame'
    ]),
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

.win-modal {
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

  &__container {
    width: 400px;
    color: $purpleText;
    border: 4px solid $purpleBorder;
    border-radius: 60px;
    display: flex;
    flex-direction: column;
    background: $purpleBg;
    padding-bottom: 30px;
  }

  &__title {
    text-align: center;
    font-size: 40px;
    font-weight: 600;
    color: $purpleDark;
    margin: 10px;
  }

  &__line {
    @include gradientLine;
    height: 3px;
    width: 80%;
    max-width: 1000px;
    margin: 0 auto;
  }

  &__content {
    width: 100%;
    margin: 20px auto;
    padding: 0 30px;
    box-sizing: border-box;
    word-wrap: break-word;
    text-align: center;
  }

  &__text {
    font-size: 25px;
    color: $purpleDarker;
    margin: 10px 0;
  }

  &__footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }

  &__button {
    padding: 8px 16px;
    font-size: 20px;
    margin: 0;
  }
}
</style>
