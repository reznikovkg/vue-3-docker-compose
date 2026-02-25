<template>
  <div class="page">
    <div class="controls">
      <h2>Счет: {{ score }}</h2>
      <button class="controls__button" @click="() => start()">Начать игру</button>
    </div>

    <BubbleGame
      :colors-count="5"
      :target-color="2"
      :intensity="1.5"
      :score-hit="1"
      :score-miss="-5"
      :bubble-size="80"
      :duration="30"
      :start-game="(cb) => registerStart(cb)"
      @score="(val) => onScore(val)"
      @finish="(val) => onFinish(val)"
    />
  </div>
</template>

<script>
import BubbleGame from '../ui/BubbleGame.vue'

export default {
  components: { BubbleGame },

  data() {
    return {
      score: 0,
      startHandler: null
    }
  },

  methods: {
    registerStart(cb) {
      this.startHandler = cb
    },

    start() {
      this.score = 0
      if (this.startHandler) this.startHandler()
    },

    onScore(val) {
      this.score = val
    },

    onFinish(val) {
      alert(`Игра окончена. Итоговый счет: ${val}`)
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  margin: 0;
  padding: 0;
  background-color: #979ccc;
  min-height: 100vh;
}

.controls {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  gap: 20px;
  align-items: center;
  background: #979ccc;
  padding: 10px 20px;
  border-radius: 30px;
  backdrop-filter: blur(5px);

  h2 {
    margin: 0;
    color: white;
  }

  &__button {
    background-color: #f07db6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #ff1493;
      transform: scale(1.05);
    }
  }
}
</style>