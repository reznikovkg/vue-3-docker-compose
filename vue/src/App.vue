<template>
  <RouterView />
  <div class="app">
    <h1 class="app__title">Bubble game - Multi-size</h1>
    <div class="app__controls">
      <span>Target color:</span>
      <span class="app__color" :style="{ background: targetColor }"></span>
      <!-- Fonction fléchée dans le template -->
      <button class="app__btn" @click="() => toggleGame()">
        {{ running ? 'Stop' : 'Start' }}
      </button>
    </div>
    <div class="app__score">Score : {{ score }}</div>
    <!-- Légende des tailles -->
    <div class="app__legend">
      <div class="app__legend-item">
        <div class="app__legend-bubble large"></div>
        <span>Large (-5 if error, -10 if lost)</span>
      </div>
      <div class="app__legend-item">
        <div class="app__legend-bubble medium"></div>
        <span>Average (-3 if error, -6 if lost)</span>
      </div>
      <div class="app__legend-item">
        <div class="app__legend-bubble small"></div>
        <span>Small (-1 if error, -3 if lost)</span>
      </div>
    </div>
    <!-- Jeu actif -->
    <BubbleGame
      v-if="running"
      :colorsCount="colorsCount"
      :targetColor="targetColor"
      :spawnRate="spawnRate"
      :scoreGood="scoreGood"
      :scoreBad="scoreBad"
      @finish="() => endGame()"
    />
   
    <!-- Résultat -->
    <div class="app__result" v-else-if="score !== 0">
      <div class="app__result-box">
        <h2>🎉 Game over! 🎉</h2>
        <p>Final Score : <strong>{{ score }}</strong></p>
        <button class="app__btn" @click="() => restart()">Replay 🔄</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import BubbleGame from "./components/BubbleGame.vue";
const store = useStore();
const score = computed(() => store.getters.score);
const running = ref(false);
const colorsCount = 5;
const targetColor = "red";
store.commit("SET_TARGET_COLOR", targetColor);
const spawnRate = 1;
const scoreGood = 1;
const scoreBad = -5;
// Toutes fonctions fléchées comme demandé
const toggleGame = () => {
  if (!running.value) {
    store.commit("RESET_SCORE");
    store.commit("CLEAR_BUBBLES");
  }
  running.value = !running.value;
};
const restart = () => {
  store.commit("RESET_SCORE");
  store.commit("CLEAR_BUBBLES");
  running.value = true;
};
const endGame = () => {
  running.value = false;
};
</script>
<style scoped lang="less">
.app {
  text-align: center;
  padding: 20px;
  &__title {
    font-size: 28px;
    margin-bottom: 10px;
  }
  &__controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  &__color {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border: 2px solid black;
  }
  &__btn {
    padding: 6px 14px;
    cursor: pointer;
  }
  &__score {
    font-size: 22px;
    margin-bottom: 10px;
  }
  &__legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }
  &__legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  &__legend-bubble {
    border-radius: 50%;
    border: 2px solid #333;
   
    &.large {
      width: 25px;
      height: 25px;
      background: linear-gradient(145deg, #ff6b6b, #ff5252);
    }
   
    &.medium {
      width: 20px;
      height: 20px;
      background: linear-gradient(145deg, #4ecdc4, #44a08d);
    }
   
    &.small {
      width: 15px;
      height: 15px;
      background: linear-gradient(145deg, #ffe66d, #ffd166);
    }
  }
  &__result {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  &__result-box {
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 20px 35px;
    border-radius: 12px;
    box-shadow: 0 0 10px #000;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
}
</style>
