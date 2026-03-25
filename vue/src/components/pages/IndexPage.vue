<template>
  <div class="index-page">
    <div class="index-page__header">
      <h2 class="index-page__title">Пятнашки</h2>
      <div class="index-page__line"/>
    </div>

    <div class="index-page__content">
      <div class="index-page__section-title">Правила игры</div>
      <div class="index-page__text">- Перед вами поле из фишек с числами и одной пустой клеткой</div>
      <div class="index-page__text">- Цель - упорядочить все фишки по возрастанию слева направо и сверху вниз</div>
      <div class="index-page__text">
        - Перемещать можно только те фишки,
        которые находятся рядом с пустой клеткой
        (по горизонтали или вертикали)
      </div>
      <div class="index-page__section-title">Важно</div>
      <div class="index-page__text">Перед началом игра необходимо задать размер поля.</div>
      <div class="index-page__text">Нажмите "Начать игру" и введите ширину и высоту поля.</div>
      <div class="index-page__text">Удачи!</div>
    </div>

    <div class="index-page__button-wrapper">
      <CustomButton @click="() => openModal()">Начать игру</CustomButton>
    </div>

    <SettingsModal
        v-show="isModalVisible"
        @close="() => closeModal()"
        @play="(sizeData) => startGame(sizeData)"
    />
  </div>
</template>

<script>
import CustomButton from "@/components/ui/CustomButton.vue";
import SettingsModal from "@/components/modals/SettingsModal.vue";
import {mapActions} from "vuex";

export default {
  name: 'IndexPage',
  components: {
    CustomButton,
    SettingsModal
  },
  data() {
    return {
      isModalVisible: false
    }
  },
  methods: {
    ...mapActions({
      saveGameSize: 'updateGameSize'
    }),
    openModal() {
      this.isModalVisible = true
    },
    closeModal() {
      this.isModalVisible = false
    },
    startGame(sizeData) {
      this.saveGameSize(sizeData)
          .then(() => {
            this.closeModal()
            this.$router.push({name: this.$routes.TAG_GAME})
          })
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.index-page {
  &__header {
    text-align: center;
  }

  &__title {
    text-align: center;
    color: $purpleDark;
    font-size: 70px;
    font-weight: 700;

    @media (max-width: 480px) {
      font-size: 40px;
    }
  }

  &__line {
    @include gradientLine;
    height: 3px;
    width: 80%;
    max-width: 1000px;
    margin: 0 auto;
  }

  &__content {
    @include containerPadding;
    width: 100%;
    max-width: 950px;
    margin: 0 auto;
    word-wrap: break-word;
  }

  &__section-title {
    font-size: 40px;
    font-weight: 600;
    color: $purpleDark;
    margin: 10px;

    @media (max-width: 480px) {
      font-size: 30px;
    }
  }

  &__text {
    font-size: 30px;
    color: $purpleDarker;

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }

  &__button-wrapper {
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;

    :deep(.c-button) {
      @media (max-width: 480px) {
        font-size: 24px;
        padding: 12px 24px;
      }
    }
  }
}
</style>
