<template>
  <section class="bubble-page">
    <teleport to="body">
      <div v-if="isGameOver" class="bubble-page__modal">
        <div class="bubble-page__modal-box">
          <h2 class="bubble-page__modal-title">Игра завершена</h2>
          <p class="bubble-page__modal-text">Итоговый счёт: {{ finalPoints }}</p>
          <button class="bubble-page__modal-button" @click="() => startNewGame()">
            Начать заново
          </button>
          <RouterLink class="bubble-page__modal-button bubble-page__modal-button--menu" :to="{ name: 'MENU' }">
            В главное меню
          </RouterLink>
        </div>
      </div>

      <div v-if="isPauseOpen" class="bubble-page__modal" @click.self="() => closePause()">
        <div class="bubble-page__modal-box">
          <h2 class="bubble-page__modal-title">Пауза</h2>
          <button class="bubble-page__modal-button" @click="() => continueGame()">
            Продолжить
          </button>
          <RouterLink class="bubble-page__modal-button bubble-page__modal-button--menu" :to="{ name: 'MENU' }">
            В главное меню
          </RouterLink>
        </div>
      </div>
    </teleport>

    <aside class="bubble-page__sidebar">
      <h1 class="bubble-page__title">Мыльные пузыри</h1>
      <p class="bubble-page__info">Нужный цвет: {{ targetColorLabel }}</p>
      <p class="bubble-page__info">Количество цветов: {{ colorsCount }}</p>
      <p class="bubble-page__info">Шариков в секунду: {{ spawnRate }}</p>
      <p class="bubble-page__info">За правильный пузырь: +1</p>
      <p class="bubble-page__info">Штраф за ошибку: большой -5, средний -3, маленький -1</p>
      <p class="bubble-page__info">Пропуск нужного пузыря: большой -10, средний -6, маленький -3</p>
      <p class="bubble-page__info">Осталось времени: {{ timeLeft }} сек.</p>
      <p class="bubble-page__info">Текущие очки: {{ currentPoints }}</p>

      <div class="bubble-page__buttons">
        <button v-if="!gameStarted" class="bubble-page__button" @click="() => startNewGame()">
          Старт
        </button>
        <button
          v-if="gameStarted && !isGameOver"
          class="bubble-page__button bubble-page__button--stop"
          @click="() => openPause()"
        >
          Стоп
        </button>
        <RouterLink class="bubble-page__button bubble-page__button--menu" :to="{ name: 'MENU' }">
          Назад в меню
        </RouterLink>
      </div>
    </aside>

    <div class="bubble-page__game-area">
      <BubbleGame
        ref="gameRef"
        :colors-count="colorsCount"
        :target-color="targetColor"
        :spawn-rate="spawnRate"
        :hit-points="1"
        :miss-points="-5"
        :game-time="60"
        :on-start="onGameStart"
        @score="onScoreChange"
        @finish="onGameFinish"
        @time="onTimeChange"
      />
    </div>
  </section>
</template>

<script>
import BubbleGame from './../game/BubbleGame.vue'

export default {
  name: 'GamePage',
  components: { BubbleGame },
  data() {
    return {
      currentPoints: 0,
      finalPoints: 0,
      isGameOver: false,
      isPauseOpen: false,
      gameStarted: false,
      timeLeft: 60
    }
  },
  computed: {
    colorsCount() {
      return this.$store.state.colorsCount
    },
    targetColor() {
      return this.$store.state.targetColor
    },
    spawnRate() {
      return this.$store.state.spawnRate
    },
    targetColorLabel() {
      const colorNames = {
        blue: 'синий',
        green: 'зеленый',
        orange: 'оранжевый',
        pink: 'розовый',
        purple: 'фиолетовый',
        red: 'красный',
        yellow: 'желтый'
      }
      return colorNames[this.targetColor] || this.targetColor
    }
  },
  methods: {
    onGameStart() {
      this.currentPoints = 0
      this.finalPoints = 0
      this.isGameOver = false
      this.isPauseOpen = false
      this.gameStarted = true
      this.timeLeft = 60
    },
    onScoreChange(value) {
      this.currentPoints = value
    },
    onGameFinish(value) {
      this.finalPoints = value
      this.isGameOver = true
      this.isPauseOpen = false
      this.gameStarted = false
    },
    onTimeChange(value) {
      this.timeLeft = value
    },
    startNewGame() {
      this.isGameOver = false
      this.isPauseOpen = false
      this.timeLeft = 60
      this.gameStarted = true
      if (this.$refs.gameRef) this.$refs.gameRef.restartGame()
    },
    openPause() {
      this.isPauseOpen = true
      if (this.$refs.gameRef) this.$refs.gameRef.pauseGame()
    },
    closePause() {
      this.isPauseOpen = false
    },
    continueGame() {
      this.isPauseOpen = false
      if (this.$refs.gameRef) this.$refs.gameRef.resumeGame()
    }
  }
}
</script>

<style scoped lang="scss">
.bubble-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #eef3f8;

  &__sidebar {
    width: 320px;
    padding: 24px;
    background: #ffffff;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
    z-index: 2;
    box-sizing: border-box;
  }

  &__title {
    margin-bottom: 20px;
    font-size: 34px;
  }

  &__info {
    margin: 8px 0;
    font-size: 18px;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }

  &__button {
    display: block;
    width: 100%;
    padding: 12px 18px;
    border: none;
    border-radius: 8px;
    background-color: #4d96ff;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    box-sizing: border-box;
  }

  &__button--stop {
    background-color: #e85d75;
  }

  &__button--menu {
    background-color: #6c757d;
  }

  &__game-area {
    flex: 1;
    height: 100vh;
    padding: 0;
    overflow: hidden;
  }

  &__modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  &__modal-box {
    width: 320px;
    padding: 30px;
    border-radius: 14px;
    background: #ffffff;
    text-align: center;
  }

  &__modal-title {
    margin-bottom: 15px;
    font-size: 28px;
  }

  &__modal-text {
    margin-bottom: 20px;
    font-size: 18px;
  }

  &__modal-button {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    background-color: #4d96ff;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    text-decoration: none;
    box-sizing: border-box;
  }

  &__modal-button--menu {
    background-color: #6c757d;
  }
}
</style>