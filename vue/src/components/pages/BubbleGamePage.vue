<template>
  <div class="bubble-game gradient-bg">
    <div v-if="!isPlaying" class="overlay">
      <div class="panel">
        <h1>Игра "Мыльные пузыри" 🫧</h1>

        <div class="field">
          <label>Количество цветов (2-6):</label>
          <input
            type="number"
            :value="config.colorCount"
            @input="updateConfigField('colorCount', $event.target.value)"
            min="2"
            max="6"
          />
        </div>

        <div class="field">
          <label>Целевой цвет:</label>
          <input
            type="color"
            :value="config.targetColor"
            @input="updateConfigField('targetColor', $event.target.value)"
          />
        </div>

        <div class="field">
          <label>Интенсивность (шт/сек):</label>
          <input
            type="number"
            :value="config.intensity"
            @input="updateConfigField('intensity', $event.target.value)"
            min="0.1"
            max="3"
            step="0.1"
          />
        </div>

        <div class="field">
          <label>Очки за попадание:</label>
          <input
            type="number"
            :value="config.correctScore"
            @input="updateConfigField('correctScore', $event.target.value)"
          />
        </div>

        <div class="field">
          <label>Очки за ошибку:</label>
          <input
            type="number"
            :value="config.wrongScore"
            @input="updateConfigField('wrongScore', $event.target.value)"
          />
        </div>

        <button @click="handleStart" class="btn primary">🎮 Начать игру</button>
        <RouterLink :to="{ name: $routes.INDEX }" class="btn"
          >← Назад</RouterLink
        >
      </div>
    </div>

    <button v-if="isPlaying" @click="handleStop" class="btn stop">
      ⏸ Стоп
    </button>

    <div v-if="hasResult" class="overlay">
      <div class="panel">
        <h2>🎉 Игра окончена!</h2>
        <div class="final-score">{{ finalScore }}</div>
        <p class="label">Финальный счёт</p>
        <button @click="handleReset" class="btn primary">🔄 Новая игра</button>
      </div>
    </div>

    <BubbleGame
      v-if="isPlaying"
      ref="gameRef"
      v-bind="config"
      @finish="handleFinish"
      @score="handleScore"
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

<style>
@import "@/assets/bubble-game.css";
</style>
