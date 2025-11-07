<template>
  <div class="app">
    <h1 class="app__title">Bubbles Game </h1>

    <div class="app__controls">
      <span>Color to click :</span>
      <span class="app__color" :style="{ background: targetColor }"></span>

      <button class="app__btn" @click="() => toggleGame()">
        {{ running ? "Stop" : "To start up" }}
      </button>
    </div>

    <div class="app__score">Score : {{ score }}</div>

    <BubbleGame
      v-if="running"
      :colorsCount="colorsCount"
      :targetColor="targetColor"
      :spawnRate="spawnRate"
      :scoreGood="scoreGood"
      :scoreBad="scoreBad"
      @score="(s) => (score = s)"
      @finish="(final) => endGame(final)"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import BubbleGame from "./components/BubbleGame.vue";

const colorsCount = 5;
const targetColor = "red";
const spawnRate = 1;
const scoreGood = 1;
const scoreBad = -5;

const score = ref(0);
const running = ref(false);

const toggleGame = () => {
  score.value = 0;
  running.value = !running.value;
};

const endGame = (finalScore) => {
  running.value = false;
  alert(` Game over. Final score : ${finalScore}`);
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
}
</style>
