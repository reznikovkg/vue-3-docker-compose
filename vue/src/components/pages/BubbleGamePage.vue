<template>
  <div class="game-page">
    <div v-if="!isPlaying" class="game-page__overlay">
      <div class="game-page__panel">
        <h1>Игра "Мыльные пузыри" 🫧</h1>

        <div class="game-page__field">
          <label class="game-page__label">Количество цветов (2-6):</label>
          <input
            class="game-page__input"
            type="number"
            :value="config.colorCount"
            @input="e => updateConfigField('colorCount', e.target.value)"
            min="2"
            max="6"
          />
        </div>

        <div class="game-page__field">
          <label class="game-page__label">Целевой цвет:</label>
          <input
            class="game-page__input game-page__input--color"
            type="color"
            :value="config.targetColor"
            @input="e => updateConfigField('targetColor', e.target.value)"
          />
        </div>

        <div class="game-page__field">
          <label class="game-page__label">Интенсивность (шт/сек):</label>
          <input
            class="game-page__input"
            type="number"
            :value="config.intensity"
            @input="e => updateConfigField('intensity', e.target.value)"
            min="0.1"
            max="3"
            step="0.1"
          />
        </div>

        <div class="game-page__field">
          <label class="game-page__label">Очки за попадание:</label>
          <input
            class="game-page__input"
            type="number"
            :value="config.correctScore"
            @input="e => updateConfigField('correctScore', e.target.value)"
          />
        </div>

        <div class="game-page__field">
          <label class="game-page__label">Очки за ошибку:</label>
          <input
            class="game-page__input"
            type="number"
            :value="config.wrongScore"
            @input="e => updateConfigField('wrongScore', e.target.value)"
          />
        </div>

        <button class="game-page__btn game-page__btn--primary" @click="() => handleStart()">
          🎮 Начать игру
        </button>
        <RouterLink :to="{ name: $routes.INDEX }" class="game-page__btn">
          ← Назад
        </RouterLink>
      </div>
    </div>

    <button 
      v-if="isPlaying" 
      class="game-page__btn game-page__btn--stop"
      @click="() => handleStop()"
    >
      ⏸ Стоп
    </button>

    <div v-if="hasResult" class="game-page__overlay">
      <div class="game-page__panel game-page__panel--result">
        <h2>🎉 Игра окончена!</h2>
        <div class="game-page__final-score">{{ finalScore }}</div>
        <p class="game-page__label">Финальный счёт</p>
        <button class="game-page__btn game-page__btn--primary" @click="() => handleReset()">
          🔄 Новая игра
        </button>
      </div>
    </div>

    <BubbleGame
      v-if="isPlaying"
      ref="gameRef"
      v-bind="config"
      @finish="score => handleFinish(score)"
      @score="data => handleScore(data)"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useStore } from "vuex";
import BubbleGame from "../BubbleGame.vue";

const store = useStore();
const gameRef = ref(null);

const config = computed(() => store.getters["bubbleGame/getConfig"]);
const isPlaying = computed(() => store.getters["bubbleGame/getIsPlaying"]);
const finalScore = computed(() => store.getters["bubbleGame/getFinalScore"]);
const hasResult = computed(() => store.getters["bubbleGame/hasResult"]);

const updateConfigField = (field, value) => {
  const numValue = [
    "colorCount",
    "intensity",
    "correctScore",
    "wrongScore",
  ].includes(field)
    ? Number(value)
    : value;
  store.dispatch("bubbleGame/updateConfig", { [field]: numValue });
};

const handleStart = () => {
  store.dispatch("bubbleGame/startGame");
  nextTick(() => {
    gameRef.value?.start();
  });
};

const handleStop = () => {
  store.dispatch("bubbleGame/stopGame");
};

const handleFinish = (score) => {
  store.dispatch("bubbleGame/finishGame", score);
};

const handleScore = (data) => {
  store.dispatch("bubbleGame/updateScore", data.score);
};

const handleReset = () => {
  store.dispatch("bubbleGame/resetResult");
};
</script>

<style scoped lang="less">
.game-page {
  width: 100%;
  height: 100vh;

  &__overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    background: linear-gradient(135deg, #FFE66D, #FF6B9D, #C44569, #A8E6CF, #FFD93D);
  }

  &__panel {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px 50px;
    border-radius: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 100%;
    backdrop-filter: blur(20px);

    &--result {
      text-align: center;
      padding: 60px 80px;
    }
  }

  &__btn {
    width: 100%;
    padding: 18px;
    font-size: 20px;
    font-weight: 900;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #A8E6CF, #6BCF7F);
    color: white;
    text-decoration: none;
    display: block;
    text-align: center;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(168, 230, 207, 0.4);
    }

    &--primary {
      background: linear-gradient(135deg, #FF6B9D, #C44569);
    }

    &--stop {
      width: auto;
      margin-top: 0;
      text-transform: none;
      border-radius: 50px;
      padding: 15px 30px;
      font-size: 18px;
      position: fixed;
      top: 30px;
      right: 40px;
      z-index: 1001;
      background: rgba(255, 255, 255, 0.95);
      color: #FF4757;
    }
  }

  &__field {
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__label {
    flex: 0 0 220px;
    font-weight: 700;
    color: #555;
    font-size: 16px;
  }

  &__input {
    flex: 1;
    padding: 14px 18px;
    border: 3px solid #e0e0e0;
    border-radius: 15px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #FF6B9D;
      box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
    }

    &--color {
      height: 50px;
      cursor: pointer;
    }
  }

  &__final-score {
    font-size: 72px;
    font-weight: 900;
    color: #FF6B9D;
    margin: 20px 0;
  }
}
</style>
