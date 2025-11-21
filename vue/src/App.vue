<template>
  <RouterView />

  <div class="app">
    <h1 class="app__title">Bubble game</h1>

    <div class="app__controls">
      <span>Target color:</span>
      <span class="app__color" :style="{ background: targetColor }"></span>

      <!-- ✔ Correction : pas de fonction fléchée -->
      <button class="app__btn" @click="toggleGame">
        {{ running ? "Stop" : "Start" }}
      </button>
    </div>

    <div class="app__score">Score : {{ score }}</div>

    <!-- Jeu actif -->
    <BubbleGame
      v-if="running"
      :colorsCount="colorsCount"
      :targetColor="targetColor"
      :spawnRate="spawnRate"
      :scoreGood="scoreGood"
      :scoreBad="scoreBad"
      @finish="endGame"
    />

    <!-- Résultat -->
    <div class="app__result" v-else-if="score !== 0">
      <div class="app__result-box">
        <h2>🎉 Game over! 🎉</h2>
        <p>Final Score : <strong>{{ score }}</strong></p>

        <!-- ✔ Correction : pas de fonction fléchée -->
        <button class="app__btn" @click="restart">Replay 🔄</button>
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

// ✔ Vue standard
const toggleGame = () => {
  if (!running.value) {
    store.commit("RESET_SCORE");
  }
  running.value = !running.value;
};

const restart = () => {
  store.commit("RESET_SCORE");
  running.value = true;
};

// Pour BubbleGame
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

  /* ✔ Correction : ces blocs sont maintenant bien "dans" .app */
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
    to   { opacity: 1; transform: scale(1); }
  }
}
</style>
